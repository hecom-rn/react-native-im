import React from 'react';
import { ActivityIndicator, Image, InteractionManager, StyleSheet, View, Text } from 'react-native';
import { Typings } from '../../../standard';
import Listener from '@hecom/listener';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import RNFS from 'react-native-fs';
import Toast from 'react-native-root-toast';

const voiceListenerKey = 'react-native-im_VoiceBubble_voice_listener_key'
const voiceHttpHeaders = {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/21.0',
};

function localPathOf(message: Typings.Message.General): string | undefined {
    return message.data.localPath;
}

function remotePathOf(message: Typings.Message.General): string | undefined {
    return message.data.remotePath;
}

// 预下载的全局并发限制：会话打开时列表内语音组件集中挂载，
// 限流排队避免与消息列表数据加载争抢网络与原生线程，拖慢首屏展示
const prefetchQueue: Array<() => void> = [];
let prefetchActive = 0;
const MAX_PREFETCH_PARALLEL = 2;

function schedulePrefetch(task: () => Promise<void>): Promise<void> {
    return new Promise((resolve, reject) => {
        const run = () => {
            prefetchActive += 1;
            task().then(resolve, reject).finally(() => {
                prefetchActive -= 1;
                const next = prefetchQueue.shift();
                if (next) next();
            });
        };
        if (prefetchActive < MAX_PREFETCH_PARALLEL) {
            run();
        } else {
            prefetchQueue.push(run);
        }
    });
}

export type Props = Typings.Action.Display.Params<Typings.Message.VoiceBody>;

export interface State {
    isPlaying: boolean;
    isDownloading: boolean;
}

export default class extends React.PureComponent<Props, State> {
    protected audioRecorderPlayer?: AudioRecorderPlayer;

    state: State = {
        isPlaying: false,
        isDownloading: false,
    };
    voiceListener: any;
    // 每次动作递增，用于丢弃下载期间被打断（互斥/停止/卸载）的过期回调
    actionSeq: number = 0;

    constructor(props: Props) {
        super(props);
        this.audioRecorderPlayer = new AudioRecorderPlayer();
        this.voiceListener = Listener.register(voiceListenerKey, ()=>{
            this.actionSeq += 1;
            this.audioRecorderPlayer?.stopPlayer?.();
            this.setState({isPlaying: false, isDownloading: false});
        });
    }

    componentDidMount() {
        this.props.enableBubble(true);
        // 进入页面、拉取历史消息、收到新消息都表现为组件挂载：静默预下载一次，
        // 全程无任何 UI；失败静默，等用户点击时再提示
        this._prefetch();
    }

    componentDidUpdate(prevProps: Props) {
        // 列表复用组件时 message 会变，状态与缓存记录须按消息重置并重新预下载
        if (prevProps.message.messageId !== this.props.message.messageId) {
            this.actionSeq += 1;
            this.cachedPath = '';
            this.cachedMessageId = '';
            this.setState({isPlaying: false, isDownloading: false});
            this._prefetch();
        }
    }

    componentWillUnmount() {
        Listener.unregister(voiceListenerKey, this.voiceListener);
        this.actionSeq += 1;
        this.audioRecorderPlayer?.stopPlayer?.();
    }

    render() {
        const {isSender} = this.props;
        let content;
        if (this.state.isDownloading) {
            content = <ActivityIndicator style={styles.image} size={'small'} color={'#999999'} />;
        } else {
            const image = this.state.isPlaying ?
                (isSender ? require('./image/senderVoicePlaying.gif') : require('./image/receiverVoicePlaying.gif')) :
                (isSender ? require('./image/senderVoice.png') : require('./image/receiverVoice.png'));
            content = (
                <Image
                    style={styles.image}
                    source={image}
                    resizeMode={'contain'}
                />
            );
        }
        return (
            <View style={[styles.container]}>
                {isSender && this._renderTimeLabel(false)}
                {content}
                {!isSender && this._renderTimeLabel(true)}
            </View>
        );
    }

    public onPress() {
        if (this.state.isDownloading) {
            // 下载很快，进行中忽略点击
            return;
        }
        if (this.state.isPlaying) {
            this.actionSeq += 1;
            this.audioRecorderPlayer?.stopPlayer();
            this.setState({isPlaying: false});
            return;
        }
        Listener.trigger(voiceListenerKey);
        const seq = ++this.actionSeq;
        const {message} = this.props;
        const duration = message.data.duration;
        // 预加载已完成：直接展示播放动画，全程无 loading
        const cached = this.cachedMessageId === message.messageId ? this.cachedPath : '';
        if (cached) {
            this.setState({isPlaying: true});
            this._play(cached, seq, duration, true);
            return;
        }
        // 预加载未完成：先显示 loading，下载完成后自动播放；手动点击失败需有提示
        this.setState({isDownloading: true, isPlaying: false});
        this._startDownloadIfNeed()
            .then((path) => {
                if (seq !== this.actionSeq) return;
                this.setState({isDownloading: false, isPlaying: true});
                this._play(path, seq, duration);
            })
            .catch((e) => {
                if (seq !== this.actionSeq) return;
                this.setState({isDownloading: false, isPlaying: false});
                Toast.show('语音下载失败，请稍后重试');
            });
    }

    // canRetry：缓存路径播放失败时（缓存文件可能已被系统清理），重置缓存状态后
    // 自动重新下载再播一次；重新下载的文件播放仍失败则按文件损坏提示，不再重试
    protected async _play(path: string, seq: number, duration: number, canRetry: boolean = false) {
        try {
            const isRemote = path.indexOf('http') === 0;
            await this.audioRecorderPlayer?.startPlayer(path, isRemote ? voiceHttpHeaders : undefined);
        } catch (e) {
            if (seq !== this.actionSeq) return;
            this.audioRecorderPlayer?.stopPlayer?.();
            RNFS.unlink(path).catch(() => {});
            this.setState({isPlaying: false});
            if (canRetry) {
                this.cachedPath = '';
                this.cachedMessageId = '';
                this.downloadPromise = null;
                this.setState({isDownloading: true});
                try {
                    const newPath = await this._startDownloadIfNeed();
                    if (seq !== this.actionSeq) return;
                    this.setState({isDownloading: false, isPlaying: true});
                    return this._play(newPath, seq, duration, false);
                } catch (e2) {
                    if (seq !== this.actionSeq) return;
                    this.setState({isDownloading: false, isPlaying: false});
                    Toast.show('语音下载失败，请稍后重试');
                    console.warn('voice retry failed:', e2 && e2.message);
                    return;
                }
            }
            Toast.show('语音播放失败，文件可能已损坏');
            console.warn('voice play failed:', e && e.message);
            return;
        }
        if (seq !== this.actionSeq) return;
        const wait = duration > 1000 ? duration : 0;
        setTimeout(() => {
            if (seq !== this.actionSeq) return;
            this.setState({isPlaying: false});
        }, wait);
    }

    // 静默预下载：等交互空闲后排入全局队列限流执行，避免打开会话时与消息列表加载争抢资源；
    // 点击触发的下载不经过队列（_startDownloadIfNeed 直接执行），天然优先于预下载
    protected _prefetch() {
        InteractionManager.runAfterInteractions(() => {
            schedulePrefetch(() =>
                this._startDownloadIfNeed().catch((e) => {
                    console.warn('voice prefetch failed:', e && e.message);
                })
            );
        });
    }

    // 挂载预下载与点击播放共用：同一条消息进行中则复用同一 promise，失败后允许下次重新触发；
    // 已就绪的缓存路径记录在 cachedPath，点击时无需再显示 loading
    protected downloadPromise: Promise<string> | null = null;
    protected downloadMessageId: string = '';
    protected cachedPath: string = '';
    protected cachedMessageId: string = '';

    protected _startDownloadIfNeed(): Promise<string> {
        const {message} = this.props;
        if (this.cachedMessageId === message.messageId && this.cachedPath) {
            return Promise.resolve(this.cachedPath);
        }
        if (!this.downloadPromise || this.downloadMessageId !== message.messageId) {
            this.downloadMessageId = message.messageId;
            const promise = this._resolveVoiceFile(localPathOf(message), remotePathOf(message))
                .then((path) => {
                    this.cachedPath = path;
                    this.cachedMessageId = message.messageId;
                    return path;
                })
                .catch((e) => {
                    if (this.downloadPromise && this.downloadMessageId === message.messageId) {
                        this.downloadPromise = null;
                    }
                    throw e;
                });
            this.downloadPromise = promise;
        }
        return this.downloadPromise;
    }

    // 远程语音直接流播时，弱网下 prepare 会长时间阻塞且失败无提示；
    // 统一先落到本地缓存（按 messageId 命中缓存 / localPath / 下载 remotePath）再播放。
    protected async _resolveVoiceFile(localPath?: string, remotePath?: string): Promise<string> {
        const {message} = this.props;
        const cacheFile = `${RNFS.CachesDirectoryPath}/imVoice_${message.messageId}.m4a`;
        if (await RNFS.exists(cacheFile)) {
            return cacheFile;
        }
        // iOS 录音与播放都按相对名解析到 Caches 目录，Android 是绝对路径
        const localFile = !localPath
            ? ''
            : localPath.indexOf('/') >= 0
                ? localPath
                : `${RNFS.CachesDirectoryPath}/${localPath}`;
        if (localFile && (await RNFS.exists(localFile))) {
            return localFile;
        }
        if (!remotePath) {
            throw new Error('voice file not found');
        }
        const tempFile = `${cacheFile}.downloading`;
        let result;
        try {
            result = await RNFS.downloadFile({
                fromUrl: remotePath,
                toFile: tempFile,
                headers: voiceHttpHeaders,
            }).promise;
        } catch (e) {
            RNFS.unlink(tempFile).catch(() => {});
            throw e;
        }
        const stat = await RNFS.stat(tempFile);
        if (result.statusCode !== 200 || !stat.size) {
            RNFS.unlink(tempFile).catch(() => {});
            throw new Error(`voice download failed: ${result.statusCode}`);
        }
        await RNFS.moveFile(tempFile, cacheFile);
        return cacheFile;
    }

    _renderTimeLabel(isLeft: boolean) {
        const time = Math.floor(this.props.message.data.duration / 1000);
        const margin = Math.min(this.props.maxWidth, time * 3) + 10;
        const style = isLeft ? {
            marginRight: margin,
            marginLeft: 10,
        } : {
            marginLeft: margin,
            marginRight: 10,
        };
        return (
            <Text style={[styles.time, style]}>
                {time + "\""}
            </Text>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        marginLeft: 10,
        marginRight: 10,
        marginBottom: 12,
        marginTop: 12,
    },
    image: {
        width: 20,
        height: 20
    },
    time: {
        color: '#333333',
        backgroundColor: 'transparent',
    },
});
