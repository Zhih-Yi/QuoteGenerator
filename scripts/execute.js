let quotesArr=[];let pageData= [];let nowPage=1;modeIsDay=true;
$(document).ready(function () {   
//取得語錄陣列
    getQuotes();

//取得預設主題
chrome.storage.local.get({modePopup: []},function(items) {
  modeIsDay=items.modePopup||'';
  $('#mode').attr('checked',!modeIsDay);
  if(modeIsDay){
    $('.popup').removeClass('night'); 
    $('.popup').addClass('day');
   
  }else{
    $('.popup').addClass('night'); 
    $('.popup').removeClass('day');
  }
});
//主題切換
$('#mode').on('click',changeTheme);
 
//新增區域展開
$('.js-add').on('click',function(){
$('.js-add-group').toggleClass('d-none');
$('.js-text').focus();
})
//新增送出按鈕點選
$('.js-add-text').on('click',addQuote);
$('.js-text').on('keyup',function(e){
  let code =e.key;
  if(code==="Enter"){
   addQuote();

}
})
})

//取得資料(並分頁)
function getQuotes(){
  
chrome.storage.sync.get({quotes: []},function(items) {
    quotesArr=items.quotes||[];
    if(quotesArr.length===0){
      let defaultQ="人生中，你會經歷很多艱難的時刻，但這也會讓你意識到以前不曾在意過的好時光。";
      let id = Math.floor(Date.now());
      let defaultQuote={Quote:defaultQ,Id:id};
      quotesArr.push(defaultQuote);
    } 
   pagination(quotesArr,nowPage);
   Display(pageData);

}); 
}
//新增語錄
function addQuote(){
  //若無內容則返回
  if($('.js-text').val()==="")return;
  let quote = $('.js-text').val().trim().replace(/[&<>"'`=\/]/g,"");
  let id = Math.floor(Date.now());
  let obj={Quote:quote,Id:id};
  quotesArr.push(obj);
  chrome.storage.sync.set({ quotes: quotesArr });
  getQuotes()
  $('.js-text').val('');
  $('.js-text').focus();
}
//畫面顯示分頁後結果
function Display(data){
    //呈現於畫面
    let str='';
    data.forEach(value => {
        str+=`<tr><td><span>${value.Quote}</span> <input type="text" data-num="${value.Id}" class="d-none form-control js-input-update"/></td>
        <td class="text-right">
        <a href="#" class=" mr-2 js-update" data-num="${value.Id}"><i class="fas fa-pen"></i></a>
        <a href="#" class="mr-2 js-delete" data-num="${value.Id}"><i class="fas fa-trash"></i></a>
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
})
$('.js-input-update').keyup(function (e) { 
  if($(this).val()==="")return;
  let code =e.key;

  if(code==="Enter"){
      let id =$(this).data('num');
      let quote =$(this).val().trim().replace(/[&<>"'`=\/]/g,"");
      let obj={Quote:quote,Id:id};
      let itemindex=quotesArr.findIndex(x=>x.Id===id);
      quotesArr.splice(itemindex,1,obj);
      chrome.storage.sync.set({ quotes: quotesArr });
     getQuotes();
  }
});
//註冊delete相關evnet
$('.js-delete').on('click',function(e){
  e.preventDefault();
  let id =$(this).data('num'); 
  let itemindex=quotesArr.findIndex(x=>x.Id===id);
  quotesArr.splice(itemindex,1);
  chrome.storage.sync.set({ quotes: quotesArr });
  getQuotes();
})
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
        $('.popup').removeClass('night'); 
        $('.popup').addClass('day');
       
      }else{
        $('.popup').addClass('night'); 
        $('.popup').removeClass('day');
      }

      chrome.storage.local.set({modePopup:modeIsDay});

  }