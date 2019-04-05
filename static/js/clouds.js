window.onload = function()
{
    var boxes = [
        document.getElementById('info-box1'),
        document.getElementById('info-box2'),
        document.getElementById('info-box3'),
        document.getElementById('info-box4')
    ];

    var texts = [
        document.getElementById('info-text1'),
        document.getElementById('info-text2'),
        document.getElementById('info-text3'),
        document.getElementById('info-text4')
    ];

    boxes.forEach(function(box, index)
    {
        box.addEventListener('click', function(){
            // remove boxes class
            boxes.forEach(function(b){
               b.classList.remove('opened-info');
            });

            // remove text class
            texts.forEach(function(t){
               t.classList.add('info-closed');
            });

            // set right classes
            texts[index].classList.remove('info-closed');
            this.classList.add('opened-info');
        });
    });
};