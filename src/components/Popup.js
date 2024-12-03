import * as React from "react";
import { View } from "react-native";
import { Button, Paragraph, Dialog, Portal } from "react-native-paper";

// This is a popup component
// callback is triggered if the user pressed the 'Done' button

const Popup = ({ title, message, callback }) => {
  const [visible, setVisible] = React.useState(true);

  const hideDialog = async () => {
    console.log("hide dialog");
    setVisible(false);
    if (callback) await callback();
  };

  return (
    <View>
      <Portal>
        <Dialog visible={visible} onDismiss={hideDialog}>
          <Dialog.Title>{title}</Dialog.Title>
          <Dialog.Content>
            <Paragraph>{message}</Paragraph>
          </Dialog.Content>
          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Done</Button>
            </Dialog.Actions>
          </View>
        </Dialog>
      </Portal>
    </View>
  );
};

export default Popup;
