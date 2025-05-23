let typeNotefication =document.getElementById('typeNotefication')
let typeNoteficationBtn =document.getElementById('typeNoteficationBtn')

typeNotefication.style.visibility = ('hidden')
typeNoteficationBtn.addEventListener('click' ,  function(){
    typeNotefication.style.visibility = ('visible')

})

let changePassWord_screen =document.getElementById('changePassWord_screen')
let changePassWordBtn =document.getElementById('changePassWordBtn')

changePassWord_screen.style.visibility = ('hidden')
changePassWordBtn.addEventListener('click' ,  function(){
    changePassWord_screen.style.visibility = ('visible')

})








function checkInputDirection(input) {
    const text = input.value;
    const isArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text) || /[0-9]/.test(text);
    
    if (isArabic) {
        input.style.direction = 'rtl';
        input.style.textAlign = 'right'; 
    } else {
        input.style.direction = 'ltr';
        input.style.textAlign = 'left'; 
    }
}