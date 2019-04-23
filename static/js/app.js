window.onload = function()
{
    // when clicking on the boxes, show the appropriate field
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

    // when the user clicks on the link, show a text box for easy copying
    var lnkVat = document.getElementById('lnk-vat');
    lnkVat.addEventListener('click', function() {
        window.prompt("Copy to clipboard: CTRL+C, Enter", lnkVat.getAttribute('data-raw'));
    });

    var lnkBank = document.getElementById('lnk-bank');
    lnkBank.addEventListener('click', function() {
        window.prompt("Copy to clipboard: CTRL+C, Enter", lnkBank.getAttribute('data-raw'));
    });
};