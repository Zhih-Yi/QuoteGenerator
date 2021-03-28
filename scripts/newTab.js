let imageDayArr=[];
let imageNightArr=[];
let quotesArr=[];
let nowPage=1;
let modeIsDay=true;
$(document).ready(function(){
//取得語錄
GetQuotes();

//取得預設主題
chrome.storage.local.get({modeMain:true},function(items) {
modeIsDay=items.modeMain;
$('#mode').attr('checked',!modeIsDay);
if(modeIsDay){
$('.main').removeClass('night'); 
$('.main').addClass('day');

}else{
$('.main').addClass('night'); 
$('.main').removeClass('day');
}
});
//主題切換
$('#mode').on('click',changeTheme);
//取得隨機背景圖片(日夜)
Promise.all([getRandomImage('ImageDay'),getRandomImage('ImageNight')])
.then((res)=>{

imageDayArr=res[0];
imageNightArr=res[1];
if(imageDayArr.length===0){
    imageDayArr.push('images/bg-default-day.jpg');
}
if(imageNightArr.length===0){
    imageNightArr.push('images/bg-default-night.jpg');
}
GetRandom();
//瀏覽圖片與刪除
ManageImage();

});

//新增語錄按鈕，雙擊畫面文字新增
$('.quoteText').on('click',function(){
    $(this).addClass('d-none');
    $('.addQuote').removeClass('d-none');
    $('.addQuote texarea').focus();
})
//選單按鈕 展開
$('.menu-btn').on('click',function (e) { 
    e.preventDefault();
    $('body').addClass('show');
    $('.quoteText').click();
    });
    //選單按鈕 返回
    $('.js-menu-btn-fold').on('click',function (e) { 
    e.preventDefault();
    $('body').removeClass('show');
    $('.btn-cancelAdd').click();
    });
//取消新增語錄
$('.btn-cancelAdd').on('click',function(){
    $(this).parent().parent().find('textarea').val('');
    $('.addQuote').addClass('d-none');
    $('.quoteText').removeClass('d-none');
});
//新增語錄
$('.btn-add').on('click',function(){
    let quote=$(this).parent().parent().find('textarea').val();
    console.log(quote);
    if(quote==="")return;
    quote = quote.trim().replace(/[&<>"'`=\/]/g,"");
    let id = Math.floor(Date.now());
    let obj={Quote:quote,Id:id};
    quotesArr.push(obj);
    chrome.storage.sync.set({ quotes: quotesArr });
    $(this).parent().parent().find('textarea').val('');
    $('.addQuote').addClass('d-none');
    $('.quoteText').removeClass('d-none');

});
//設定按鈕背景 前往設定背景
$('.btn-bg').on('click',function(){
$('.quote-setting').addClass('d-none');
$('.bg-setting').removeClass('d-none');
})
//語錄設定按鈕 前往設定語錄
$('.btn-quote').on('click',function(){
$('.quote-setting').removeClass('d-none');
$('.bg-setting').addClass('d-none');
})

//背景圖片摺疊標示
$('.js-btn-fold').click(function(){
let el =$(this).find('i');
if(el.hasClass('fa-chevron-down')){
el.removeClass('fa-chevron-down');
el.addClass('fa-chevron-up');
}else{
el.addClass('fa-chevron-down');
el.removeClass('fa-chevron-up');  
}
});
//上傳按鈕
$('.image-layer').on('click',function(){
$(this).parent().parent().find('input[type="file"]').click();
});
//上傳change事件
let fileDay;
let fileNight;
$('.js-fileinput').on('change',function(){

if(this.files && this.files[0]){
let reader = new FileReader();
reader.readAsDataURL(this.files[0]);
let vm=this;
if($(this).hasClass('js-fileinput-day')){
fileDay=this.files[0];
}else{
fileNight=this.files[0];
}
reader.onload=function(e){
//移除遮罩上傳文字
$(vm).parent().find('.image-layer').removeClass('image-layer-color');
$(vm).parent().find('.img-cover').attr('src',e.target.result);
$(vm).parent().find('.layer-title').addClass('d-none');
}
}
});
//儲存圖片按鈕
$('.js-saveimg-day').on('click',function(){

if(fileDay){
let reader = new FileReader();
reader.readAsDataURL(fileDay);
let vm=this;
reader.onload=function(e){
imageDayArr.push(e.target.result);
chrome.storage.local.set( { ImageDay : imageDayArr } ,function(){
    ManageImage();
});
fileDay='';

$(vm).parent().parent().find('.image-layer').addClass('image-layer-color');
$(vm).parent().parent().find('.img-cover').attr('src',"images/bg-default-day.jpg");
$(vm).parent().parent().find('.layer-title').removeClass('d-none');
}
}

});

$('.js-saveimg-night').on('click',function(){

if(fileNight){
let reader = new FileReader();
reader.readAsDataURL(fileNight);
let vm=this;
reader.onload=function(e){
imageNightArr.push(e.target.result);
chrome.storage.local.set( { ImageNight : imageNightArr },function(){
    ManageImage();
} );
fileNight='';
$(vm).parent().parent().find('.image-layer').addClass('image-layer-color');
$(vm).parent().parent().find('.img-cover').attr('src',"images/bg-default-night.jpg");
$(vm).parent().parent().find('.layer-title').removeClass('d-none');
}
}

});


//取消儲存按鈕還原上傳區
$('.js-btn-cancel-day').on('click',function(){
$(this).parent().parent().find('.image-layer').addClass('image-layer-color');
$(this).parent().parent().find('.img-cover').attr('src',"bg-images/bg-default-day.jpg");
$(this).parent().parent().find('.layer-title').removeClass('d-none');
});
$('.js-btn-cancel-night').on('click',function(){
$(this).parent().parent().find('.image-layer').addClass('image-layer-color');
$(this).parent().parent().find('.img-cover').attr('src',"bg-images/bg-default-night.jpg");
$(this).parent().parent().find('.layer-title').removeClass('d-none');
});



})

//取得語錄
function GetQuotes(){
chrome.storage.sync.get({quotes: []},function(items) {
quotesArr=items.quotes||[];       
pagination(quotesArr,nowPage);
Display(pageData);    
}); 
}

function GetRandom(){
let random;
let imageCurrent;
let quoteCurrent;
//判斷白天黑夜模式 

if(modeIsDay===true){
//隨機圖片
random=Math.floor(Math.random()*imageDayArr.length);

imageCurrent=imageDayArr[random]; 
}
else{
random=Math.floor(Math.random()*imageNightArr.length);

imageCurrent=imageNightArr[random]; 
}
//隨機文字
let quoteIndex=Math.floor(Math.random()*quotesArr.length);
quoteCurrent=quotesArr[quoteIndex];
//設定圖片
$('.js-quoteBg').css('background-image',`url('${imageCurrent}')`);
//設定文字
$('.quoteText').html(`<p>${quoteCurrent.Quote}</p>`);
}

/*取得隨機文字圖片 */
let keyvalue='';
function getRandomImage(key){
keyvalue=key;
return new Promise((resolve, reject)=>{
try{
if(keyvalue==="ImageDay"){
chrome.storage.local.get({ImageDay: []},function(items) {
    resolve(items.ImageDay);

});
}
else{
chrome.storage.local.get({ImageNight: []},function(items) {
    resolve(items.ImageNight);

});
}
} 
catch(ex){
    reject(ex);
}       
})      
}

/*圖片瀏覽刪除 */
function ManageImage(){

let dayImagestr='';
let nightImagestr='';

 $.each(imageDayArr,function(index,value){

    dayImagestr+=`<div class="img-item p-4"><img src="${value}"  alt="" width="100" height="120" data-num="${index}" />
    <input type="checkbox" data-num="${index}" class="d-none"/><span class="img-check d-none"><i class="fas fa-trash-alt"></i></span></div>`;
});
$.each(imageNightArr,function(index,value){
    nightImagestr+=`<div class="img-item p-4"><img src="${value}" alt="" width="100" height="120" data-num="${index}"/>
    <input type="checkbox" data-num="${index}" class="d-none"/><span class="img-check d-none"><i class="fas fa-trash-alt"></i></span></div>`;
}); 

$('.imagesBox-day').html(dayImagestr);
$('.imagesBox-night').html(nightImagestr);

//註冊圖片選取/刪除
$('.img-item').on('click',function(){

    $(this).find('img').toggleClass('selected');
    $(this).find('.img-check').toggleClass('d-none');
    let checkbox=$(this).find('input[type="checkbox"]');
    if( checkbox.is(':checked')){
        checkbox.attr('checked',false);
    } else{
        checkbox.attr('checked',true);
    }
    
})
/*圖片刪除 */
$('.js-btn-image-delete').on('click',function(){
    let deleteItmesDay= $('.imagesBox-day .img-item input:checked');
    let deleteItmesNight= $('.imagesBox-night .img-item input:checked');
    $.each(deleteItmesDay,function(index,value){

        let indexDay = $(value).data('num');
        imageDayArr.splice(indexDay,1);
    })
    $.each(deleteItmesNight,function(index,value){
      
        let indexNight = $(value).data('num');
        imageNightArr.splice(indexNight,1);
    })
  
    chrome.storage.local.set({ ImageDay: imageDayArr });
    chrome.storage.local.set({ ImageNight: imageNightArr });
    ManageImage();
})
}
/*語錄分頁*/
//畫面顯示分頁後結果
function Display(data){
//呈現於畫面
let str='';
data.forEach(value => {
str+=`<tr><td><span>${value.Quote}</span> <input type="text" data-num="${value.Id}" class="d-none form-control js-input-update"/></td>
<td class="text-right">
<a href="#" class=" mr-2 js-update" data-num="${value.Id}"><i class="fas fa-pen"></i></a>
<a href="#" class="js-delete" data-num="${value.Id}"><i class="fas fa-trash"></i></a>
</td></tr>`;
});

$('.js-table-quotes').html(str);
//生成畫面後
//註冊update related event
$('.js-update').on('click',function(e){
e.preventDefault();
let id =$(this).data('num');
let elupdate=$(this).parent().parent().find(`input[data-num="${id}"]`);
elupdate.toggleClass('d-none');
elupdate.focus();
let text=elupdate.parent().find('span');
text.toggleClass('d-none');
elupdate.val(text.text());
});

$('.js-input-update').keyup(function (e) { 
    if($(this).val()===""){return;}
    let code =e.key;
    if(code==="Enter"){
    let id =$(this).data('num');
    let quote =$(this).val().trim().replace(/[&<>"'`=\/]/g,"");
    let obj={Quote:quote,Id:id};
    let itemindex=quotesArr.findIndex(x=>x.Id===id);
    quotesArr.splice(itemindex,1,obj);
    chrome.storage.sync.set({ quotes: quotesArr });
    GetQuotes();
    }
});

//註冊delete相關evnet
$('.js-delete').on('click',function(e){
e.preventDefault();
let id =$(this).data('num'); 
let itemindex=quotesArr.findIndex(x=>x.Id===id);
quotesArr.splice(itemindex,1);
chrome.storage.sync.set({ quotes: quotesArr });
GetQuotes();
});
}

//分頁
function pagination(data,nowPage){

const dataTotal = data.length;
const perpage = 5;
const pageTotal = Math.ceil(dataTotal / perpage);
let currentPage = nowPage;

if (currentPage > pageTotal) {
currentPage = pageTotal;
}
const minData= (currentPage*perpage)-perpage+1;
const maxData =currentPage*perpage;
pageData=[];
$.each(data,(index,value)=>{
let num =index+1;
if ( num >= minData && num <= maxData) {
pageData.push(value);
}
})

//pagination btns
const page = {
dataTotal,pageTotal,
currentPage,
hasPage: currentPage > 1,
hasNext: currentPage < dataTotal,
}
pageBtns(page);

}
//頁面按鈕
const pagegroup = document.querySelector('.pages');
function pageBtns (page){
let str = '';
const total = page.pageTotal;
if(page.hasPage) {
str += `<li class="page-item"><a class="page-link" href="#" data-page="${Number(page.currentPage) - 1}">&laquo;</a></li>`;
} else {
str += `<li class="page-item disabled"><span class="page-link">&laquo;</span></li>`;
}

for(let i = 0; i < total; i++){
str +=`<li class="page-item"><a class="page-link" href="#" data-page="${Number(i+1)}">${i+1}</a></li>`;
};


if(page.hasNext) {
str += `<li class="page-item"><a class="page-link" href="#" data-page="${Number(page.currentPage) + 1}">&raquo;</a></li>`;
} else {
str += `<li class="page-item disabled"><span class="page-link">&raquo;</span></li>`;
}
pagegroup.innerHTML = str;
}

/*換頁 */
function switchPage(e){

e.preventDefault();
if(e.target.nodeName !== 'A') return;
let page = e.target.dataset.page;
pagination(quotesArr, page);
Display(pageData);
nowPage=page;
}

pagegroup.addEventListener('click', switchPage);

/*主題切換 */
function changeTheme(){

modeIsDay=!modeIsDay;
if(modeIsDay){
$('.main').removeClass('night'); 
$('.main').addClass('day');

}else{
$('.main').addClass('night'); 
$('.main').removeClass('day');
}

chrome.storage.local.set({modeMain:modeIsDay});
}
