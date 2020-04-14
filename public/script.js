// canvas / signature code goes here
(function () {
    console.log("script.js running");

    const canvas = document.getElementById("canvas");
    console.log(canvas);
    const canCtx = canvas.getContext("2d");
    console.log(canCtx);
    const offset = canvas.getBoundingClientRect();
    let dataURL;
    // let hiddenInput = document.getElementById("hiddenInput");

    let drawing = false;
    let x = 0;
    let y = 0;

    canvas.addEventListener("mousedown", (e) => {
        //     console.log("mousedown happened");
        x = e.clientX - offset.left;
        y = e.clientY - offset.top;
        drawing = true;
        canCtx.moveTo(x, y);
    });

    canvas.addEventListener("mousemove", (e) => {
        if (drawing === true) {
            x = e.clientX - offset.left;
            y = e.clientY - offset.top;
            canCtx.lineTo(x, y);
            canCtx.stroke();
            dataURL = $("#canvas")[0].toDataURL();
            $("#hiddenInput").val(dataURL);
            console.log($("#hiddenInput").val(dataURL));
        }
    });

    window.addEventListener("mouseup", () => {
        if (drawing === true) {
            x = 0;
            y = 0;
            drawing = false;
        }
        console.log(dataURL);
    });
})();
