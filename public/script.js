// canvas / signature code goes here
(function () {
    const canCtx = $("canvas")[0].getContext("2d");

    let drawing = false;
    let offset = $("canvas").offset();
    let x = 0;
    let y = 0;

    $("canvas").on("mousedown", (e) => {
        console.log("mousedown happened");
        x = e.clientX - offset.left;
        y = e.clientY - offset.top;
        drawing = true;
    });

    $("canvas").on("mousemove", (e) => {
        if (drawing === true) {
            signThis(
                context,
                x,
                y,
                e.clientX - offset.left,
                e.clientY - offset.top
            );
            x = e.clientX - offset.left;
            y = e.clientY - offset.top;
        }
    });

    window.on("mouseup", (e) => {
        if (drawing === true) {
            signThis(
                context,
                x,
                y,
                e.clientX - offset.left,
                e.clientY - offset.top
            );
            x = 0;
            y = 0;
            drawing = false;
        }
    });
})();
