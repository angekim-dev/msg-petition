// canvas / signature code goes here
(function () {
    console.log("script.js running");

    const canvas = document.getElementById("canvas");
    console.log(canvas);
    const canCtx = canvas.getContext("2d");
    console.log(canCtx);
    const offset = canvas.getBoundingClientRect();
    let dataURL;
    let box = document.getElementById("hiddenInput");

    let drawing = false;
    let x = 0;
    let y = 0;

    canvas.addEventListener("mousedown", (e) => {
        //     console.log("mousedown happened");
        x = e.pageX - e.target.offsetLeft;
        y = e.pageY - e.target.offsetTop;
        drawing = true;
        canCtx.moveTo(x, y);
    });

    canvas.addEventListener("mousemove", (e) => {
        if (drawing === true) {
            console.log("drawing****");
            x = e.pageX - e.target.offsetLeft;
            y = e.pageY - e.target.offsetTop;
            console.log("XANDY", x, y);
            canCtx.lineTo(x, y);
            canCtx.strokeStyle = "hotpink";
            canCtx.stroke();
            dataURL = canvas.toDataURL();
            box.value = dataURL;
            console.log(box.value);
        }
    });

    window.addEventListener("mouseup", () => {
        if (drawing === true) {
            // x = 0;
            // y = 0;
            drawing = false;
        }
        // console.log(dataURL);
    });
})();
