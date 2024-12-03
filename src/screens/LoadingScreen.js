import * as React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { ActivityIndicator } from 'react-native-paper';

export default function LoadingScreen(props) {

    let {
        text = 'Loading'
    } = props
    return (
        <View style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            height: '100%', 
            width: '100%',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center' }}>
            <View style={{ height: 120, width: 120, borderRadius: 12, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size='large' animating={true} />
                <Text style={{ fontWeight: '600', marginTop: 5 }}>{text}</Text>
            </View>
        </View>
    );
}