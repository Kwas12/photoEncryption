let roundKeysDes = [];
let roundKeysSDes = [];

let pt = "";
let loopHowMany = 0;
let image = [];
let rgbCount = 0;
let rgbCount1 = 0;
let rgbCount2 = 0;
let rgbCount3 = 0;
let rgbCount4 = 0;
let counter = 0;
let encryptedImage = [];
let t0 = 0;
let t1 = 0;

const event = new CustomEvent("render", { detail: encryptedImage });
event.initEvent("render", true, true);

const shiftLeftOnce = (keyChunk) => {
  let shifted = "";
  for (let i = 1; i < 28; i++) {
    shifted += keyChunk[i];
  }
  shifted += keyChunk[0];

  return shifted;
};

const shiftLeftTwice = (keyChunk) => {
  let shifted = "";

  for (let i = 2; i < 28; i++) {
    shifted += keyChunk[i];
  }
  shifted += keyChunk[0];
  shifted += keyChunk[1];

  return shifted;
};

const xor = (stringA, stringB) => {
  let result = "";
  let size = stringB.length;
  for (let i = 0; i < size; i++) {
    if (stringA[i] !== stringB[i]) {
      result += "1";
    } else {
      result += "0";
    }
  }

  return result;
};

const convertDecimalToBinary = (number, toNumber) => {
  let stringNumber = parseInt(number + "", 10).toString(2);

  while (stringNumber.length < toNumber) {
    stringNumber = "0" + stringNumber;
  }

  // console.log(stringNumber);
  return stringNumber;
};

const convertBinaryToDecimal = (string) => {
  let convertNumber = Number(parseInt(string, 2).toString(10));
  // console.log(convertNumber);
  return convertNumber;
};

const generateKeys = (key) => {
  //The PC1 table
  // prettier-ignore
  const pc1 = [
  57,49,41,33,25,17,9,
	1,58,50,42,34,26,18,
	10,2,59,51,43,35,27,
	19,11,3,60,52,44,36,
	63,55,47,39,31,23,15,
	7,62,54,46,38,30,22,
	14,6,61,53,45,37,29,
	21,13,5,28,20,12,4
  ];

  // prettier-ignore
  const pc2 = [
  14,17,11,24,1,5,
	3,28,15,6,21,10,
	23,19,12,4,26,8,
	16,7,27,20,13,2,
	41,52,31,37,47,55,
	30,40,51,45,33,48,
	44,49,39,56,34,53,
	46,42,50,36,29,32
  ];

  let permKey = "";

  for (let i = 0; i < 56; i++) {
    permKey += key[pc1[i] - 1];
  }

  let left = permKey.slice(0, 28);
  let right = permKey.slice(28, 56);

  for (let i = 0; i < 16; i++) {
    if (i === 0 || i === 1 || i === 8 || i === 15) {
      left = shiftLeftOnce(left);
      right = shiftLeftOnce(right);
    } else {
      left = shiftLeftTwice(left);
      right = shiftLeftTwice(right);
    }

    let combinedKey = left + right;
    let roundKey = "";
    for (let i = 0; i < 48; i++) {
      roundKey += combinedKey[pc2[i] - 1];
    }
    roundKeysDes[i] = roundKey;
  }
};

const loopDES = (howManyTime, counter, howManyPerLoop) => {
  rgbCount = 0;
  const numberCores = 8;

  var workers = [];

  for (let cores = 0; cores < numberCores; cores++) {
    workers.push({ workerFlag: false, worker: new Worker("worker.js") });
  }

  workers.forEach((worker, index) => {
    worker.worker.onmessage = function (e) {
      console.log(
        index,
        (rgbCount * 8 * howManyTime) / howManyPerLoop,
        ((rgbCount + 1) * 8 * howManyTime) / howManyPerLoop
      );
      if (rgbCount < counter) {
        worker.worker.postMessage([
          image.slice(
            (rgbCount * 8 * howManyTime) / howManyPerLoop,
            ((rgbCount + 1) * 8 * howManyTime) / howManyPerLoop
          ),
          howManyTime,
          howManyPerLoop,
          roundKeysDes,
          (rgbCount * 8 * howManyTime) / howManyPerLoop,
          ((rgbCount + 1) * 8 * howManyTime) / howManyPerLoop - 1,
        ]);
        ++rgbCount;
      } else {
        worker.workerFlag = true;
      }

      let encryptedValue = e.data[0];
      let j = 0;
      for (let i = e.data[1]; i <= e.data[2]; i++) {
        encryptedImage[i] = encryptedValue[j];
        j++;
      }
      const myCanvas = document.querySelector("#myCanvas");
      myCanvas.dispatchEvent(event);
      var elem = document.getElementById("myBar");
      var countBar = document.getElementById("countBar");
      elem.style.width = (rgbCount / counter) * 100 + "%";
      countBar.innerHTML = (rgbCount / counter) * 100 + "%";

      if (
        workers
          .map((worker) => {
            if (worker.workerFlag === true) {
              return 1;
            }
            return 0;
          })
          .reduce((prev, current) => prev + current) === numberCores
      ) {
        t1 = performance.now();
        alert(`Ukonczono z czasem: ${(t1 - t0).toFixed(2)} ms`);
      }
    };
  });

  workers.forEach((worker, index) => {
    worker.worker.postMessage([
      image.slice(
        (rgbCount * 8 * howManyTime) / howManyPerLoop,
        ((rgbCount + 1) * 8 * howManyTime) / howManyPerLoop
      ),
      howManyTime,
      howManyPerLoop,
      roundKeysDes,
      (rgbCount * 8 * howManyTime) / howManyPerLoop,
      ((rgbCount + 1) * 8 * howManyTime) / howManyPerLoop - 1,
    ]);
    console.log(
      (rgbCount * 8 * howManyTime) / howManyPerLoop,
      ((rgbCount + 1) * 8 * howManyTime) / howManyPerLoop - 1
    );
    ++rgbCount;
  });
};

const loopSDES = (encrypted, howManyTime, counter) => {
  for (let i = 0; i < howManyTime; i++) {
    pt = convertDecimalToBinary(image[rgbCount++], 8);

    const encryptedValue = sDesProgram(encrypted);

    encryptedImage.push(convertBinaryToDecimal(encryptedValue));
  }

  var elem = document.getElementById("myBar");
  var countBar = document.getElementById("countBar");
  elem.style.width = ((257 - counter) / 256) * 100 + "%";
  countBar.innerHTML = ((257 - counter) / 256) * 100 + "%";

  counter--;
  if (counter > 0) {
    setTimeout(() => loopSDES(encrypted, howManyTime, counter), 0);
    const myCanvas = document.querySelector("#myCanvas");
    myCanvas.dispatchEvent(event);
  } else {
    encryptedImage.length = 0;
    t1 = performance.now();
    alert(`Ukonczono z czasem: ${(t1 - t0).toFixed(2)} ms`);
  }
};

const encryption = (pixels) => {
  clearViable();

  for (let i = 0; i < pixels.data.length; i += 4) {
    image.push(pixels.data[i]);
    image.push(pixels.data[i + 1]);
    image.push(pixels.data[i + 2]);
  }

  const howMany = image.length;

  const decodeCheckBox = document.querySelector("#encryptionSelector");
  const decodeAlgorytmCheckBox = document.querySelector(
    "#encryptionSelectorAlgorytm"
  );

  if (!!Number(decodeAlgorytmCheckBox.value)) {
    // key generate sDes
    let key = "0010010111";
    sDesKayGenerator(key);
    pt = "10100101";

    t0 = performance.now();
    loopSDES(!!Number(decodeCheckBox.value), howMany / 256, 257);
  } else {
    let key =
      "1010101010111011000010010001100000100111001101101100110011011101";
    generateKeys(key);

    const decodeCheckBox = document.querySelector("#encryptionSelector");
    if (Number(decodeCheckBox.value)) {
      let reverseKeys = [];
      for (let i = 0; i < 16; i++) {
        reverseKeys[i] = roundKeysDes[15 - i];
      }
      roundKeysDes = reverseKeys;
    }

    console.log(howMany);

    for (let i = 0; i < 1024; i++) {
      if (howMany % i === 0 && (howMany / 3 / i) % 64 === 0) {
        counter = i;
      }
    }
    if (counter === 0) {
      counter = 8;
    }
    console.log("tak" + counter);

    const howManyPerLoop = counter * 8;

    rgbCount2 = counter / 4;
    rgbCount3 = rgbCount2 * 2;
    rgbCount4 = rgbCount2 * 3;

    console.log(rgbCount1, rgbCount2, rgbCount3, rgbCount4);

    t0 = performance.now();
    loopDES(howMany, counter, howManyPerLoop);
  }
};

const clearViable = () => {
  roundKeysDes = [];
  pt = "";
  loopHowMany = 0;
  image = [];
  rgbCount = 0;
  rgbCount1 = 0;
  rgbCount2 = 0;
  rgbCount3 = 0;
  rgbCount4 = 0;
  encryptedImage.length = 0;
};

const sDesProgram = (encrypted) => {
  const initialPermutation = [2, 6, 3, 1, 4, 8, 5, 7];
  const inverseInitialPermutation = [4, 1, 3, 5, 7, 2, 8, 6];
  const E = [4, 1, 2, 3, 2, 3, 4, 1];

  const S = [
    [
      [1, 0, 3, 2],
      [3, 2, 1, 0],
      [0, 2, 1, 3],
      [3, 1, 3, 2],
    ],
    [
      [0, 1, 2, 3],
      [2, 0, 1, 3],
      [3, 0, 1, 0],
      [2, 1, 0, 3],
    ],
  ];

  const P4 = [2, 4, 3, 1];

  let perm = "";

  for (let i = 0; i < 8; i++) {
    perm += pt[initialPermutation[i] - 1];
  }

  let leftPerm = perm.slice(0, 4);
  let rightPerm = perm.slice(4, 8);

  //sdesFunction
  perm = "";
  let fK2 = "";
  for (let j = 0; j < 2; j++) {
    for (let i = 0; i < 8; i++) {
      perm += rightPerm[E[i] - 1];
    }

    if (encrypted) {
      perm = xor(roundKeysSDes[j], perm);
    } else {
      perm = xor(roundKeysSDes[1 - j], perm);
    }

    let leftS0 = perm.slice(0, 4);
    let rightS1 = perm.slice(4, 8);

    const S0row = leftS0[0] + leftS0[3];
    const S0col = leftS0[1] + leftS0[2];

    const S1row = rightS1[0] + rightS1[3];
    const S1col = rightS1[1] + rightS1[2];

    const S0String = convertDecimalToBinary(
      S[0][convertBinaryToDecimal(S0row)][convertBinaryToDecimal(S0col)],
      2
    );
    const S1String = convertDecimalToBinary(
      S[1][convertBinaryToDecimal(S1row)][convertBinaryToDecimal(S1col)],
      2
    );

    const S0S1 = S0String + S1String;

    let permS0S1 = "";
    for (let i = 0; i < 4; i++) {
      permS0S1 += S0S1[P4[i] - 1];
    }

    if (j === 0) {
      perm = rightPerm + xor(leftPerm, permS0S1);
      leftPerm = perm.slice(0, 4);
      rightPerm = perm.slice(4, 8);
      perm = "";
    } else {
      fK2 = xor(leftPerm, permS0S1) + rightPerm;
    }
  }

  let cipherText = "";
  for (let i = 0; i < 8; i++) {
    cipherText += fK2[inverseInitialPermutation[i] - 1];
  }

  return cipherText;
};

const sDesKayGenerator = (key) => {
  const p10Permutation = [3, 5, 2, 7, 4, 10, 1, 9, 8, 6];
  const p8Permutation = [6, 3, 7, 4, 8, 5, 10, 9];

  for (let i = 0; i < 2; i++) {
    let permutation10Key = "";
    for (let j = 0; j < 10; j++) {
      permutation10Key += key[p10Permutation[j] - 1];
    }

    let leftKey = permutation10Key.slice(1, 5) + permutation10Key.slice(0, 1);
    let rightKey = permutation10Key.slice(6, 10) + permutation10Key.slice(5, 6);
    permutation10Key = leftKey + rightKey;

    if (i === 1) {
      leftKey = permutation10Key.slice(2, 5) + permutation10Key.slice(0, 2);
      rightKey = permutation10Key.slice(7, 10) + permutation10Key.slice(5, 7);
      permutation10Key = leftKey + rightKey;
    }

    let permutation8Key = "";
    for (let j = 0; j < 8; j++) {
      permutation8Key += permutation10Key[p8Permutation[j] - 1];
    }

    roundKeysSDes.push(permutation8Key);
  }
};

export default encryption;
