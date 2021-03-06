import encryption from "./encryption.js";

let pictureDate = {
  file: 0,
  pixels: 0,
};
let canvas;

const saveButton = document.querySelector("#saveButton");
saveButton.addEventListener("click", () => save());

const encryptionButton = document.querySelector("#encryptionButton");
encryptionButton.addEventListener("click", () =>
  encryption(pictureDate.pixels, canvas)
);

const myCanvas = document.querySelector("#myCanvas");
myCanvas.addEventListener("render", (e) => encryptionPicture(e));

window.addEventListener("load", function () {
  document
    .querySelector('input[type="file"]')
    .addEventListener("change", function () {
      if (this.files && this.files[0]) {
        const img = document.querySelector("#myImg");
        img.onload = () => {
          URL.revokeObjectURL(img.src);
        };
        img.src = URL.createObjectURL(this.files[0]);
        pictureDate.file = this.files[0];
      }
      setTimeout(() => setNewPictureInCanvas(), 100);
    });
});

const Canvas = function (canvasEl, width, height) {
  this.el = canvasEl;
  this.el.width = width;
  this.el.height = height;
  this.ctx = canvasEl.getContext("2d");
};

const encryptionPicture = (e) => {
  // TODO: add e.pictureValue
  const encryptionPixels = e.detail;

  for (let i = 0, j = 0; i < pictureDate.pixels.data.length; i += 4, j += 3) {
    pictureDate.pixels.data[i] = encryptionPixels[j];
    pictureDate.pixels.data[i + 1] = encryptionPixels[j + 1];
    pictureDate.pixels.data[i + 2] = encryptionPixels[j + 2];
    pictureDate.pixels.data[i + 3] = 255;
  }

  // console.log(pictureDate.pixels);
  canvas.ctx.putImageData(pictureDate.pixels, 0, 0);

  console.log(canvas.ctx.getImageData(0, 0, canvas.el.width, canvas.el.height));
};

function setNewPictureInCanvas() {
  var img = document.querySelector("#myImg");
  console.log(img.width, img.height);

  canvas = new Canvas(
    document.querySelector("#myCanvas"),
    img.width,
    img.height
  );
  var encryptedPicture = new Image();
  encryptedPicture.src = URL.createObjectURL(pictureDate.file);
  encryptedPicture.onload = function () {
    canvas.ctx.drawImage(this, 0, 0, canvas.el.width, canvas.el.height);
    pictureDate.pixels = canvas.ctx.getImageData(
      0,
      0,
      canvas.el.width,
      canvas.el.height
    );
    console.log(pictureDate);
    console.log(pictureDate.file.type);

    //todo: description or encryption picture

    for (let i = 0; pictureDate.pixels.data.length > i; i += 4) {
      let red = pictureDate.pixels.data[i];
      let green = pictureDate.pixels.data[i + 1];
      let blue = pictureDate.pixels.data[i + 2];
      let alpha = pictureDate.pixels.data[i + 3];

      // //red
      // pictureDate.pixels.data[i] = red;
      // //green
      // pictureDate.pixels.data[i + 1] = red;
      // //blue
      // pictureDate.pixels.data[i + 2] = red;
    }
    const number = convertNumberToString(100);
    convertStringToNumber(number);
    console.log(pictureDate.pixels);
    canvas.ctx.putImageData(pictureDate.pixels, 0, 0);
  };
}

const convertNumberToString = (number) => {
  let stringNumber = parseInt(number + "", 10).toString(2);
  for (let i = 8 - stringNumber.length; i > 0; i--) {
    stringNumber = "0" + stringNumber;
  }
  /*
  let numberAdd = "";
  for (let i = 0; i < 8; i++) {
    numberAdd += stringNumber[i];
  }*/
  console.log(stringNumber);
  return stringNumber;
};

const convertStringToNumber = (string) => {
  let convertNumber = Number(parseInt(string, 2).toString(10));
  console.log(convertNumber);
};

const save = function () {
  canvas.el.toBlob(function (blob) {
    // blob ready, download it
    let link = document.createElement("a");
    link.download = pictureDate.file.name;

    link.href = URL.createObjectURL(blob);
    link.click();

    // delete the internal blob reference, to let the browser clear memory from it
    URL.revokeObjectURL(link.href);
    console.log("Download compleat");
  }, pictureDate.file.type);
};
