import * as React from 'react';
import { StyleSheet } from 'react-native';
import { FAB, Portal, Provider } from 'react-native-paper';

const MyComponent = (props) => {
  const [state, setState] = React.useState({ open: false });
  const onStateChange = ({ open }) => setState({ open });
  const navigation = props.navigation;

  const { open } = state;

  return (
    <Provider>
      <Portal>
        <FAB.Group
          open={open}
          style={styles}
          icon={open ? 'close' : 'plus'}
          actions={[
            {
                icon: 'broom',
                label: 'Edit Recommendations',
                onPress: () => navigation.push("Edit Diet"),
              },
            {
              icon: 'pencil',
              label: 'Log Manually',
              onPress: () => navigation.push("Log Diet"),
            },
            {
              icon: 'camera',
              label: 'Log by Food Snap',
              onPress: () => navigation.navigate('Classify Food'),
            },
          ]}
          onStateChange={onStateChange}
          onPress={() => {
            if (open) {
              // do something if the speed dial is open
            }
          }}
        />
      </Portal>
    </Provider>
  );
};

const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      alignSelf: 'flex-end',
      margin: 16,
      right: 0,
      bottom: 0,
    },
  })

export default MyComponent;