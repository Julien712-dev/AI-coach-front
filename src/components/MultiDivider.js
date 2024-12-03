import React from 'react';
import { View, Text } from 'react-native';
import { Divider } from 'react-native-paper';

export default function MultiDivider(prop) {
    const { thickness } = prop;
    const dividers = [...(new Array(thickness).keys())].map(index => <Divider {...prop} key={index} style={{ ...prop.style, width: '100%' }} />);
    return (
        <View style={{ width: '100%' }}>
            {dividers}
        </View>
    );
}