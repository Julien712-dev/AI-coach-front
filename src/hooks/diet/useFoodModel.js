import React, { useState, useEffect } from "react";

import * as tf from "@tensorflow/tfjs";
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";

import * as jpeg from "jpeg-js";
import * as FileSystem from "expo-file-system";

// this hook is used by FoodClassifyScreen.js

export default function useFoodModel() {
  const [predictions, setPredictions] = useState("");
  const [model, setModel] = useState(null);
  const [modelReady, setModelReady] = useState(false);

  const foodList = {
    0: ["紅燒肉", "Braised Pork"],
    1: ["雞蛋餅", "Fried egg"],
    2: ["雲吞麵", "Noodles with Wonton"],
    3: ["蔥燒海參", "Braised Sea Cucumber with Scallion"],
    4: ["四喜丸子", "Four-Joy Meatballs"],
    5: ["藍莓山藥", "Yam with Blueberry sauce"],
    6: ["炸春卷", "Deep fried Spring Rolls"],
    7: ["煎餃", "Fried dumpling"],
    8: ["油炸鬼", "Deep-fried dough sticks"],
    9: ["包子", "Steamed bun"],
    10: ["玉米沙拉", "Corn salad"],
    11: ["米飯", "Rice"],
    12: ["烤雞", "Roast chicken"],
    13: ["宮保雞丁", "Kung Pao Chicken"],
    14: ["烤雞翅", "Roast chicken wings"],
    15: ["鍋包肉", "Cripsy sweet & sour pork slices"],
    16: ["茶葉蛋", "Tea eggs"],
    17: ["皮蛋", "Shredded preserved egg"],
    18: ["蘑菇炒蔬菜", "Stired Mushrooms & vegetables"],
    19: ["炒蝦", "Spicy shrump"],
    20: ["炸蝦", "Deep fried shrump"],
    21: ["咖喱牛肉", "Beef curry"],
    22: ["土豆燉牛肉", "Braised Beef with Potatoes"],
    23: ["牛肉麵", "Beef noodles"],
    24: ["麻婆豆腐", "Mapo Tofu"],
    25: ["炒豆腐", "Mapo Tofu"],
    26: ["皮蛋豆腐", "Tofu with Preserved Eggs"],
    27: ["魚香茄子", "Braised eggplant with minced pork"],
    28: ["土豆泥", "Mashed Potato"],
    29: ["魚香肉絲", "Yu-Shiang Shredded Pork"],
    30: ["土豆絲", "Mashed Potato"],
    31: ["炒青椒", "Fried green peppers"],
    32: ["蠔油生菜", "Lettuce in Oyster Sauce"],
    33: ["涼拌木耳", "Black fungus salad"],
    34: ["蒸大閘蟹", "Steamed Dazha Crabs"],
    35: ["椒鹽魷魚", "Salt and pepper squid"],
    36: ["紫菜雞蛋湯", "Seaweed and Egg Soup"],
    37: ["滷肉飯", "Rice with Stewed Pork"],
    38: ["松仁玉米", "Stir fried corn with pine nuts"],
    39: ["秋葵炒雞蛋", "Pickles,shredded pork & vermicelli"],
  };

  useEffect(() => {
    loadModel();
    return () => {
      model?.dispose();
      setModelReady(false);
    };
  }, []);

  /* 
  const loadModel = async () => {
    console.log("inside model loading");
    const tfReady = await tf.ready();
    const modelJson = await require("~/assets/model/food/model.json");
    const modelWeight = await require("~/assets/model/food/model_weights.bin");
    const m = await tf.loadGraphModel(bundleResourceIO(modelJson, modelWeight));
    console.log("m is ", m);
    setModel(m);
  };
  */

  const loadModel = async () => {
    console.log("inside test model loading");
    await tf.ready();
    const modelJson = await require("~/assets/model/food/model.json");
    const modelWeight = await require("~/assets/model/food/model_weights.bin");
    const m = await tf.loadLayersModel(
      bundleResourceIO(modelJson, modelWeight)
    );
    setModel(m);
    const zeros = tf.zeros([1, 224, 224, 3]);
    const pred = m.predict(zeros);
    const i = pred.argMax(1).dataSync();
    console.log(i);
    setModelReady(true);
  };

  const testMobilenetModel = async () => {
    console.log("inside mbnet");
    await tf.ready();
    const modelUrl =
      "https://tfhub.dev/google/imagenet/mobilenet_v2_140_224/classification/2";
    const model = await tf.loadGraphModel(modelUrl, { fromTFHub: true });
    const zeros = tf.zeros([1, 224, 224, 3]);
    model.predict(zeros).print();
  };

  const imageToTensor = (rawImageData) => {
    const TO_UINT8ARRAY = true;
    const { width, height, data } = jpeg.decode(rawImageData, TO_UINT8ARRAY);
    // Drop the alpha channel info for mobilenet
    const buffer = new Float32Array(width * height * 3);
    let offset = 0; // offset into original data
    for (let i = 0; i < buffer.length; i += 3) {
      buffer[i] = data[offset] / 255;
      buffer[i + 1] = data[offset + 1] / 255;
      buffer[i + 2] = data[offset + 2] / 255;
      offset += 4;
    }
    return tf.tensor4d(buffer, [1, height, width, 3]);
  };

  const classifyImage = async (uri) => {
    if (model === undefined || model === null) {
      console.log("model is undefined or null");
      setPredictions("Model is not ready, please wait for a while.");
      return;
    }
    console.log("received image from: ", uri);

    try {
      const imgB64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const rawImageData = new Uint8Array(
        tf.util.encodeString(imgB64, "base64").buffer
      );

      const imageTensor = imageToTensor(rawImageData);
      //const pred = await model.predict(imageTensor).data();
      const pred = model.predict(imageTensor);
      const predIndex = pred.argMax(1).dataSync()[0];
      console.log("predindex is: ", predIndex);
      setPredictions(foodList[predIndex][1]);

      imageTensor.dispose();
      pred.dispose();
    } catch (error) {
      console.log(error);
    }
  };

  const cleanPredictions = () => {
    setPredictions("");
  };

  return { modelReady, predictions, classifyImage, cleanPredictions };
}
