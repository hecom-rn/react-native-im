import React from 'react';
import { Image, StyleSheet, View, Text } from 'react-native';
import { Typings } from '../../../standard';
import Listener from '@hecom/listener';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const voiceListenerKey = 'react-native-im_VoiceBubble_voice_listener_key'

export type Props = Typings.Action.Display.Params<Typings.Message.VoiceBody>;

export interface State {
    isPlaying: boolean;
}

export default class extends React.PureComponent<Props, State> {
    protected audioRecorderPlayer?: AudioRecorderPlayer;

    state: State = {
        isPlaying: false,
    };
    voiceListener: any;

    constructor(props: Props) {
        super(props);
        this.audioRecorderPlayer = new AudioRecorderPlayer();
        this.voiceListener = Listener.register(voiceListenerKey, ()=>{
            this.audioRecorderPlayer?.stopPlayer?.();
            this.setState({isPlaying: false});
        });
    }

    componentDidMount() {
        this.props.enableBubble(true);
    }

    componentWillUnmount() {
        Listener.unregister(voiceListenerKey, this.voiceListener);
    }

    render() {
        let image = null;
        const {isSender} = this.props;
        if (this.state.isPlaying) {
            image = isSender ?
                require('./image/senderVoicePlaying.gif') :
                require('./image/receiverVoicePlaying.gif');
        } else {
            image = isSender ?
                require('./image/senderVoice.png') :
                require('./image/receiverVoice.png');
        }
        return (
            <View style={[styles.container]}>
                {isSender && this._renderTimeLabel(false)}
                <Image
                    style={styles.image}
                    source={image}
                    resizeMode={'contain'}
                />
                {!isSender && this._renderTimeLabel(true)}
            </View>
        );
    }

    public onPress() {
        if (this.state.isPlaying) {
            this.audioRecorderPlayer?.stopPlayer();
        } else {
            Listener.trigger(voiceListenerKey);
            setTimeout(() => {
                const {message: {data: {localPath, remotePath, duration}}} = this.props;
                this.audioRecorderPlayer?.startPlayer(localPath || remotePath, { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:12.0) Gecko/20100101 Firefox/21.0' }).then(() => {
                    console.log('successfully finished playing');
                    if (duration > 1000) {
                        setTimeout(() => {
                            this.setState({isPlaying: !this.state.isPlaying});
                        }, duration);
                    } else {
                        this.setState({isPlaying: !this.state.isPlaying});
                    }
                }).catch(() => {
                    console.log('playback failed due to audio decoding errors');
                    this.setState({isPlaying: !this.state.isPlaying});
                });
            }, 100);
        }
        this.setState({isPlaying: !this.state.isPlaying});
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
