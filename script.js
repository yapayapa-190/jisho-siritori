//=========エラー==========

function showErr() {
    for (const screen of document.querySelectorAll(".screens")) {
        screen.style.display = "none" ;
    }
    document.getElementById("err_screen").style.display = "block" ;
}
//エラーが発生した時の処理

window.addEventListener("error",(event) => {
    if (event.message && event.message.includes("ResizeObserver loop")) {
        return
    }
    console.error(event.error) ;
    showErr() ;
})

window.addEventListener("unhandledrejection",(event) => {
    console.error(event.reason) ;
    showErr() ;
})


//kuromoji の辞書読み込み


let tokenizer ;

kuromoji.builder({
    dicPath :"./dict/"
}).build(function (err,t){

    if (err) {
        console.error(err) ;
        return ;
    }
    tokenizer = t ;

    document.getElementById("send_button").disabled = false ;
    console.log("辞書読み込み完了")
    
})
//========== HTML =============
const descriptionPart = document.getElementById("description_part") ; //語釈入力部


const descriptionInput = document.getElementById("description") ; //語釈の入力欄
const choiceArea = document.getElementById("choice_area") ; //単語選択のボタン
const currentWordText = document.getElementById("current_word") //現在の単語を表示する部分
const duplicateCheckText = document.getElementById("check_text") ; //循環の確認のテキスト部分
const resultCountText = document.getElementById("result_count") ; //リザルトの記録表示部分
const recordText = document.getElementById("record_text") ; //記録の表示部分
const checkYButton = document.getElementById("check_button_y") ; //確認(はい)ボタン
const checkNButton = document.getElementById("check_button_n") ; //確認(いいえ)ボタン
const choiceText = document.getElementById("choice_text") ; //単語選択時の単語、語釈の表示部分
const manualStartMode = document.getElementById("manual_start_mode")

const checkDialog = document.getElementById("check_screen") ; //

const ruleDetail = document.querySelectorAll(".rule_detail")


/*
変数一覧
currentWord 現在の単語　[{
    辞書形　.dictionaryForm
    読み .reading
    品詞 .type
    入力方式 .source 
    .split すでに分割された単語の配列
},]

wordList  説明された単語の配列 [{
    辞書形　.dictionaryForm
    読み　.reading
    入力方式 .source
    .split すでに分割された単語の配列
},]

logList 単語とその語釈の配列 [{
    単語 .word
    語釈 .description 
},]

wordsInDescription 語釈に含まれている単語の配列 [{
    辞書形　.dictionaryForm
    読み　.reading
],}

description 単語の説明

count しりとりを続けた回数

dupInfo 重複した単語についての配列 [{
    .word　語釈に含まれている説明済みの単語
    .description その単語の語釈
    .index wordList の位置 
    .position 重複した単語の位置(description の開始,文字数) {
        .start 開始位置
        .end 終了位置
    }

flag 循環語釈をプレイヤーがどう判断したかのフラグ など{
    .currentword 
    .duplicate
    .checkCurrent chekduplicate をcurrentWord に対して使った際のflag

},]

worded はすでに説明された単語の略称として使う 主にループ内の変数
wordin はいまの語釈に含まれている単語の略称 上に同じ

*/
let currentWord = {} ;
let wordList = [] ;
let logList = [] ;
let wordsInDescription = [] ;
let description = "" ;
let count = 1 ;
let dupInfo = [] ;
let wordedText = "" ;

let trueWord = {}

let flag = {
    currentWord : false,
    duplicate : false,
    checkCurrent : false
} ;

const startWordList = [{
    dictionaryForm: 'りんご',
    reading: 'リンゴ',
    source: 'auto',
    type: '名詞',
    split: [ 'りんご' ]
  },
  {
    dictionaryForm: 'ゴリラ',
    reading: 'ゴリラ',
    source: 'auto',
    type: '名詞',
    split: [ 'ゴリラ' ]
  },
  {
    dictionaryForm: 'ラッパ',
    reading: 'ラッパ',
    source: 'auto',
    type: '名詞',
    split: [ 'ラッパ' ]
  },
  {
    dictionaryForm: 'パンツ',
    reading: 'パンツ',
    source: 'auto',
    type: '名詞',
    split: [ 'パンツ' ]
  },
  {
    dictionaryForm: '机',
    reading: 'ツクエ',
    source: 'auto',
    type: '名詞',
    split: [ '机' ]
  },
  {
    dictionaryForm: '絵巻物',
    reading: 'エマキモノ',
    source: 'auto',
    type: '名詞',
    split: [ '絵巻物' ]
  },
  {
    dictionaryForm: '喉',
    reading: 'ノド',
    source: 'auto',
    type: '名詞',
    split: [ '喉' ]
  },
  {
    dictionaryForm: '泥',
    reading: 'ドロ',
    source: 'auto',
    type: '名詞',
    split: [ '泥' ]
  },
  {
    dictionaryForm: '労働',
    reading: 'ロウドウ',
    source: 'auto',
    type: '名詞',
    split: [ '労働' ]
  },
  {
    dictionaryForm: 'うさぎ',
    reading: 'ウサギ',
    source: 'auto',
    type: '名詞',
    split: [ 'うさぎ' ]
  },
  {
    dictionaryForm: '玉座',
    reading: 'ギョクザ',
    source: 'auto',
    type: '名詞',
    split: [ '玉座' ]
  },
  {
    dictionaryForm: '財宝',
    reading: 'ザイホウ',
    source: 'auto',
    type: '名詞',
    split: [ '財宝' ]
  },
  {
    dictionaryForm: '海',
    reading: 'ウミ',
    source: 'auto',
    type: '名詞',
    split: [ '海' ]
  },
  {
    dictionaryForm: '味噌',
    reading: 'ミソ',
    source: 'auto',
    type: '名詞',
    split: [ '味噌' ]
  },
  {
    dictionaryForm: '阻止',
    reading: 'ソシ',
    source: 'auto',
    type: '名詞',
    split: [ '阻止' ]
  },
  {
    dictionaryForm: 'しめ縄',
    reading: 'シメナワ',
    source: 'auto',
    type: '名詞',
    split: [ 'しめ縄' ]
  },
  {
    dictionaryForm: '輪っか',
    reading: 'ワッカ',
    source: 'auto',
    type: '名詞',
    split: [ '輪っか' ]
  },
  {
    dictionaryForm: 'かりんとう',
    reading: 'カリントウ',
    source: 'manual',
    type: '副詞',
    split: [ 'か', 'りん', 'とう' ]
  },
  {
    dictionaryForm: 'うろこ',
    reading: 'ウロコ',
    source: 'auto',
    type: '名詞',
    split: [ 'うろこ' ]
  },
  {
    dictionaryForm: '駒',
    reading: 'コマ',
    source: 'auto',
    type: '名詞',
    split: [ '駒' ]
  },
  {
    dictionaryForm: '真ん中',
    reading: 'マンナカ',
    source: 'auto',
    type: '名詞',
    split: [ '真ん中' ]
  },
  {
    dictionaryForm: '巻末',
    reading: 'カンマツ',
    source: 'auto',
    type: '名詞',
    split: [ '巻末' ]
  },
  {
    dictionaryForm: '鶴',
    reading: 'ツル',
    source: 'auto',
    type: '名詞',
    split: [ '鶴' ]
  },
  {
    dictionaryForm: 'ルーマニア',
    reading: 'ルーマニア',
    source: 'auto',
    type: '名詞',
    split: [ 'ルーマニア' ]
  },
  {
    dictionaryForm: 'アニメ',
    reading: 'アニメ',
    source: 'auto',
    type: '名詞',
    split: [ 'アニメ' ]
  },
  {
    dictionaryForm: 'メール',
    reading: 'メール',
    source: 'auto',
    type: '名詞',
    split: [ 'メール' ]
  },
  {
    dictionaryForm: 'ルーレット',
    reading: 'ルーレット',
    source: 'manual',
    type: '名詞',
    split: [ 'ルー', 'レット' ]
  },
  {
    dictionaryForm: 'トマト',
    reading: 'トマト',
    source: 'auto',
    type: '名詞',
    split: [ 'トマト' ]
  },
  {
    dictionaryForm: 'とどめる',
    reading: 'トドメ',
    source: 'auto',
    type: '動詞',
    split: [ 'とどめる' ]
  },
  {
    dictionaryForm: '免罪符',
    reading: 'メンザイフ',
    source: 'manual',
    type: '名詞',
    split: [ '免罪', '符' ]
  },
  {
    dictionaryForm: '不可能',
    reading: 'フカノウ',
    source: 'auto',
    type: '名詞',
    split: [ '不可能' ]
  },
  {
    dictionaryForm: '馬',
    reading: 'ウマ',
    source: 'auto',
    type: '名詞',
    split: [ '馬' ]
  },
  {
    dictionaryForm: '窓',
    reading: 'マド',
    source: 'auto',
    type: '名詞',
    split: [ '窓' ]
  },
  {
    dictionaryForm: '動画',
    reading: 'ドウガ',
    source: 'auto',
    type: '名詞',
    split: [ '動画' ]
  },
  {
    dictionaryForm: '画像',
    reading: 'ガゾウ',
    source: 'auto',
    type: '名詞',
    split: [ '画像' ]
  },
  {
    dictionaryForm: 'タコ',
    reading: 'タコ',
    source: 'auto',
    type: '名詞',
    split: [ 'タコ' ]
  },
  {
    dictionaryForm: '小麦',
    reading: 'コムギ',
    source: 'auto',
    type: '名詞',
    split: [ '小麦' ]
  },
  {
    dictionaryForm: '逆',
    reading: 'ギャク',
    source: 'auto',
    type: '名詞',
    split: [ '逆' ]
  },
  {
    dictionaryForm: 'クリア',
    reading: 'クリア',
    source: 'auto',
    type: '名詞',
    split: [ 'クリア' ]
  },
  {
    dictionaryForm: 'あんこ',
    reading: 'アンコ',
    source: 'auto',
    type: '名詞',
    split: [ 'あんこ' ]
  },
  {
    dictionaryForm: 'コメント',
    reading: 'コメント',
    source: 'auto',
    type: '名詞',
    split: [ 'コメント' ]
  },
  {
    dictionaryForm: 'トンネル',
    reading: 'トンネル',
    source: 'auto',
    type: '名詞',
    split: [ 'トンネル' ]
  },
  {
    dictionaryForm: 'ルール',
    reading: 'ルール',
    source: 'auto',
    type: '名詞',
    split: [ 'ルール' ]
  },
  {
    dictionaryForm: 'ルーム',
    reading: 'ルーム',
    source: 'auto',
    type: '名詞',
    split: [ 'ルーム' ]
  },
  {
    dictionaryForm: 'ムール貝',
    reading: 'ムールガイ',
    source: 'auto',
    type: '名詞',
    split: [ 'ムール貝' ]
  },
  {
    dictionaryForm: 'イカ',
    reading: 'イカ',
    source: 'auto',
    type: '名詞',
    split: [ 'イカ' ]
  },
  {
    dictionaryForm: '冠婚葬祭',
    reading: 'カンコンソウサイ',
    source: 'auto',
    type: '名詞',
    split: [ '冠婚葬祭' ]
  },
  {
    dictionaryForm: 'イメージ',
    reading: 'イメージ',
    source: 'auto',
    type: '名詞',
    split: [ 'イメージ' ]
  }
]
//馬鹿長いかつ追加するかもなので追加する際はファイルを分けるとよさそう

//かりんとうキモイ分け方しとるがうまく動く？
//対策できた気がするが、この形だと活用された動詞が無理な気がする

//かといって対策するには (表層形)*n個 + (原形) をすべて抜き出す必要がある
//めんどくさいので妥協

const wordChoiceType = ["名詞","動詞","形容詞","副詞","連体詞","接続詞","","","","","","",""]
//"",は品詞がきれいに並ぶようにするため。不要
//順番は 名詞 動詞 形容詞 副詞 連体詞 接続詞 *助詞 助動詞 感動詞 接頭詞 フィラー 記号 その他


const wordTypeAll = ["名詞","動詞","形容詞","副詞","連体詞","接続詞","助詞","助動詞","感動詞","接頭詞","フィラー","記号","その他"]














//============ 関数 ============
function choiceStartWord() {
    return startWordList[Math.floor(Math.random() * startWordList.length)] ;
}
//配列の中からランダムに選ぶ
//0~1未満 * 配列の長さ の切り捨て

function screenReset() {
    descriptionPart.style.display = "block"
    document.getElementById("choice_word_main").style.display = "none" 
    document.getElementById("manual_start_screen").style.display = "none" ;

    if (document.getElementById("show_word_mode").checked) {
        document.getElementById("show_worded").style.display = "block" ;
    }
    else {
        document.getElementById("show_worded").style.display = "none" 
    }

    for (const dialog of document.querySelectorAll("dialog")) {
        dialog.close()
    }

}
//でかいスクリーン以外の初期化


function resetGame() {
    wordList = []
    logList = []
    wordsInDescription = []
    description = ""
    dupInfo = []
    count = 1
    wordedText = "まだ説明されていません"

    flag = {
    currentWord : false,
    duplicate : false,
    checkCurrent : false
    } ;
    document.getElementById("worded_details").open = false ;
    document.getElementById("start_word_input").value = "" ; 
    document.getElementById("current_word").innerHTML = `<span class="example">現在の単語 : ${currentWord.dictionaryForm}</span>`
    document.getElementById("no_word").textContent = "" 
    document.getElementById("worded_text").textContent = wordedText 
    document.getElementById("count_text").textContent = `${count}語目`

    console.log("初期化")
}
//初期化
//currentWord の初期化を行っていないことに注意

function showScreen(id) {
    screenReset()
    for (const screen of document.querySelectorAll(".screens")) {
        screen.style.display = "none" ;
    }

    document.getElementById(id).style.display = "block" ;
    scrollTop()
}
//一旦全部消してから欲しいところを表示する
//一番でかいレイヤーのスクリーンの操作

function getTrueWord(wordInput) {


    const misstakeWords = tokenizer.tokenize(wordInput)

    trueWord ={}
    let trueWordDictionaryForm = ""
    let trueWordReading = ""
    let trueWordPart = [] //語釈に含まれているかの確認に使う


    for (let i = 0 ; i <= misstakeWords.length - 1 ; i++) {
        const tenporaryWord =
            misstakeWords[i].basic_form === "*"
                ? misstakeWords[i].surface_form
                : misstakeWords[i].basic_form

        trueWordPart.push(tenporaryWord)
            
        trueWordDictionaryForm += tenporaryWord

        const reWord = tokenizer.tokenize(tenporaryWord)
        trueWordReading += reWord[0].reading //不要だがいつか使うかも
        

        trueWord = {
            dictionaryForm : trueWordDictionaryForm,
            reading : trueWordReading,
            part : trueWordPart,
            type : misstakeWords[misstakeWords.length - 1].pos
        }
    }
}
//手入力に対して、誤分析を回避するための処理


function checkDuplicate(wordList,description) {


    dupInfo = []
    const tokens = tokenizer.tokenize(description) 

    const allWordInDescription = [] ;
    
    for (let i = 0 ; i <= tokens.length - 1 ; i++) {
        const tokenToCheck = tokens[i]
        const tenporaryWord = {
        word :tokenToCheck.basic_form === "*"
                ? tokenToCheck.surface_form
                : tokenToCheck.basic_form,
        reading : tokenToCheck.reading,
        type : tokenToCheck.pos
        }

        allWordInDescription.push(tenporaryWord)
    }
                
    //飛んで回る = 飛ぶ + て + 回る と 飛び回る = 飛ぶ + 回る の複合語 を区別するための処理
    //ボタン入力でこれを使う必要はない
    //誤分析のせいで読みが同じ保証はない かつ そもそも手入力が少ないので読みは確認しない

    
    for (let i = 0 ; i <= wordList.length - 2 ; i++) {
        // -2なのは最後の要素が必ず現在の単語になるため
        
        let wordPosition = 0
        for (let j = 0 ; j <= allWordInDescription.length - wordList[i].split.length ; j++){
            if (wordList[i].split.every((word,k) =>
            allWordInDescription[j + k].word === word )) { //連続部分列かの確認
                if (wordList[i].source === "manual"
                    || (wordList[i].source === "auto"
                        && wordChoiceType.includes(allWordInDescription[j].type) //含まれているかの確認
                        && allWordInDescription[j].reading === wordList[i].reading)) {

                            //品詞判定は一つ目の単語から行うので、
                            //あるく = あ + るく と分けられた際、文脈により、あ の品詞が変わりうる
                    dupInfo.push({
                        word : wordList[i].dictionaryForm,
                        description : wordList[i].description,
                        index : i + 1,
                        position : {
                            start : wordPosition,
                            end : wordPosition + wordList[i].dictionaryForm.length}
                    })
                }
            }
        wordPosition += tokens[j].surface_form.length 
        //開始位置の取得
        }
    }

    dupInfo = dupInfo.filter((word,index,array) => array.findIndex(other => 
        other.position.start === word.position.start
        &&
        other.position.end === word.position.end
        ) === index)
}
//wordList(配列) が　description(文字列) を分解した際の要素を持っているかの確認

function dupProsess() {

    if (flag.duplicate) {
        return
    }

    let word_dup = ""
    let checkText = ""

    for (let i = 0 ; i <= dupInfo.length - 1; i++) {
        if (i !== 0
            &&
            dupInfo[i].index === dupInfo[i - 1].index) {
            continue
        }
//index を確認するのは語釈で同じ単語で循環した際の調整
//りんご　食べ物 ののち
//食べ物　りんご、りんご、りんご、りんご、りんご　とすると、該当部が
//りんご　
//りんご
//りんご
//りんご
//食べ物
//となってしまう

        word_dup =
            i === dupInfo.length - 1
                ? dupInfo[i].word
                : `${dupInfo[i].word},`

        checkText += `${dupInfo[i].index}語目 <span class = "highlight">${dupInfo[i].word}</span> : ${dupInfo[i].description}\n`
    }
        

    dupInfo.sort((a,b) => b.position.start - a.position.start)
    //頭から処理すると<span>などで位置がずれるので逆順に処理

    let highlighted = description

    for (const position of dupInfo.map(item => item.position)) {

        highlighted = highlighted.slice(0,position.start)
        + `<span class="highlight">${highlighted.slice(position.start,position.end)}</span>`
        + highlighted.slice(position.end)
    }            

    if (flag.checkCurrent) {
        checkText = `${count}語目 <span class = "highlight">${currentWord.dictionaryForm}</span> : ${highlighted}`
    }
    //現在の単語を処理していた場合、ハイライトが崩れるため別で処理

    else {
        checkText += `${count}語目 ${currentWord.dictionaryForm} : ${highlighted}`
    }
    
    duplicateCheckText.textContent = `${word_dup} がすでに説明されています`
    document.getElementById("dup_description").innerHTML = checkText ;
    checkDialog.showModal() ;  

    flag.checkCurrent = false ;

}
//語釈の単語がすでに説明されていた時の処理

function checkWordByPart(beCheckedWords,checkingWords) {

    for (let i = 0 ; i <= beCheckedWords.length - checkingWords.length ; i++) {
        if (checkingWords.every((word,k) => 
        beCheckedWords[i + k] === word
        ))
            return true ;
    }
    return false ;
}
//checking の方が bechecked の連続部分列になってないかの確認

function success() {  
    if (wordList.length === 1) {
        wordedText = "" ;
        wordedText += currentWord.dictionaryForm ;
    }

    else if (wordList.length > 1) {
        wordedText += `,${currentWord.dictionaryForm}` ;
    }
         
    count++
    wordList[wordList.length - 1].description = description ;
    //統一的に扱うための処理

    document.getElementById("count_text").textContent = `${count}語目`

    flag = {
    currentWord : false,
    duplicate : false,
    checkCurrent : false
    } ;

    makeChoiceButton()
    //単語選択のボタン作成
    //単語選択画面の表示

    
}
//成功処理

function makeChoiceButton() {
    choiceArea.innerHTML = "" ;
    choiceText.innerHTML = `<span class="example">${currentWord.dictionaryForm} : ${description}</span>`

    const unipueWord = wordsInDescription.filter((word,index,array) => array.findIndex(other => 
        other.dictionaryForm === word.dictionaryForm 
        &&
        other.reading === word.reading
        ) === index
    )

    descriptionPart.style.display = "none" ; 
    document.getElementById("choice_word_main").style.display = "block" ;


    for (const word of unipueWord) {
        const button = document.createElement("button") ;
        
        button.textContent = word.dictionaryForm ;

        choiceArea.appendChild(button)

        button.addEventListener("click",function submitChoiceWord() {
        currentWord = {
        dictionaryForm : word.dictionaryForm,
        reading : word.reading,
        source : "auto",
        type : word.type,
        split : [word.dictionaryForm]
        }

        
        wordList.push({
            dictionaryForm : word.dictionaryForm,
            reading : word.reading,
            source : "auto",
            type : word.type,
            split : [word.dictionaryForm],
        })

        currentWordText.innerHTML = `現在の単語 : ${currentWord.dictionaryForm}`

        document.getElementById("choice_word_main").style.display = "none" ;
        descriptionPart.style.display = "block" ;

        scrollTop()
        })
    }
}
//次の単語を選ぶボタンの作成

function submitDescription() {


    setTimeout(() => {
    document.getElementById("worded_text").textContent = wordedText ;
    //単語表示設定用
    
    descriptionInput.value = "" ;
    //入力欄を空にする
    scrollTop()
    },0)

    description = descriptionInput.value

    logList.push({
            word : currentWord.dictionaryForm,
            description : description
    })
    
    const tokens = tokenizer.tokenize(description) ; //単語に分ける

    wordsInDescription = []
    for (const token of tokens) {
        if (wordChoiceType.includes(token.pos)){
            const dictionaryForm = 
                token.basic_form === "*" 
                    ? token.surface_form
                    : token.basic_form ;

            const reToken = tokenizer.tokenize(dictionaryForm)
            const dictionaryRead = reToken[0].reading

            wordsInDescription.push({
            dictionaryForm : dictionaryForm,
            reading : dictionaryRead,
            type : token.pos
            })
        }
    }

    if (wordsInDescription.length === 0) {
        document.getElementById("no_word").textContent = "説明できる単語がありませんでした"
        

        result()

        console.log("説明できる単語がない")
        return
    }

    if (checkWordByPart(tokenizer.tokenize(description).map(item => 
        item.basic_form === "*"
            ? item.surface_form
            : item.basic_form
        ),currentWord.split)) { //現在の単語を使ったか
        duplicateCheckText.textContent = `現在の単語 : ${currentWord.dictionaryForm} が説明に使われています`
        checkDialog.showModal() ;

        checkDuplicate([currentWord,""],description)
        flag.checkCurrent = true

        //"" は現在の単語を除くための処理がここにも影響するためそれを回避するためのもの


        dupInfo.sort((a,b) => b.position.start - a.position.start)
        let highlighted = description


        for (const position of dupInfo.map(item => item.position)) {

            highlighted = highlighted.slice(0,position.start)
            + `<span class="highlight">${highlighted.slice(position.start,position.end)}</span>`
            + highlighted.slice(position.end)
        }            


        document.getElementById("dup_description").innerHTML = `<span class="highlight">${currentWord.dictionaryForm}</span> : ${highlighted}`

        console.log("現在の単語を使った")
        return
    }

    checkDuplicate(wordList,description)

    if (dupInfo.length > 0 ){ //被っている単語があれば
        dupProsess() 


        flag.currentWord = true ;
        console.log("説明した単語を使った")
    } 
        
    else { //成功処理
        success()

        document.getElementById("worded_text").textContent = wordedText ;

        console.log("成功")
    }
    descriptionArea.style.height = "auto"
}
//語釈送信時に実行される関数
//ゲームの本体

function result() {


    let record = ""
    let usedWord = 0
    for (const log of logList){
        record += `<div class="example">${log.word} : ${log.description}</div>\n`;
        usedWord += tokenizer.tokenize(log.description).length
    }
    //単語 : 説明
    //単語 : 説明
    //という並びを繰り返す

    resultCountText.textContent = `記録 : ${count}回`
    document.getElementById("used_word_count").textContent = `語釈に含まれている単語 : ${usedWord}個`
    recordText.innerHTML = record
    showScreen("result_screen") 
}
//リザルト画面に移動















//==========ボタン==========
const giveDialog = document.getElementById("give_up_log")

document.getElementById("start_button").addEventListener("click",() => {
    showScreen("game_screen")
    if (manualStartMode.checked) {
        descriptionPart.style.display = "none" ;
        document.getElementById("manual_start_screen").style.display = "block" ;

        document.getElementById("show_worded").style.display = "none" 

        //start_word_button へ
    }

    else {
        currentWord = choiceStartWord()
        
        resetGame()
        wordList.push({
            dictionaryForm : currentWord.dictionaryForm,
            reading : currentWord.reading,
            source : "auto",
            type : currentWord.type,
            split : [currentWord.dictionaryForm]
        })
        
        //send_button へ
    }
})
//ボタンを押したらスタート画面

document.getElementById("start_word_button").addEventListener("click",() => {
    const startWord = document.getElementById("start_word_input").value
    if (startWord === "") {
        document.getElementById("start_word_dialog").showModal() ;
        //no_start_word_button へ
    }

    else {
        getTrueWord(startWord)

        currentWord = {
            dictionaryForm : trueWord.dictionaryForm,
            reading : trueWord.reading,
            source : "manual",
            type : trueWord.type,
            split : trueWord.part
        }

        resetGame()

        wordList.push({
            dictionaryForm : trueWord.dictionaryForm,
            reading : trueWord.reading,
            source : "manual",
            type : trueWord.type,
            split : trueWord.part
        })


        if (document.getElementById("show_word_mode").checked) {
            document.getElementById("show_worded").style.display = "block" ;
        }
        else {
            document.getElementById("show_worded").style.display = "none" 
        }


        descriptionPart.style.display = "block" ;
        document.getElementById("manual_start_screen").style.display = "none" ;
        //send_button へ
    }
})
//最初の単語を選ぶ

document.getElementById("no_start_word_button").addEventListener("click",() => {
    document.getElementById("start_word_dialog").close() ;
})
//ダイアログを閉じる

document.getElementById("send_button").addEventListener("click",submitDescription) ;
//語釈を送ったら判定,選択ボタンの表示
//ギブ,循環語釈でリザルト

checkYButton.addEventListener("click",() => {

    checkDuplicate(wordList,description)
    flag.checkCurrent =false

    checkDialog.close() ;
    if (flag.currentWord) {
        flag.duplicate = true ;
    }


    if (dupInfo.length > 0 && !flag.duplicate){ 
        dupProsess()
        flag.duplicate = true
        
        console.log("説明した単語を使った")
        //現在の単語を使用かつ説明済みの単語を使用した際の処理
    } 
        
    else { //成功処理
        success()

        document.getElementById("worded_text").textContent = wordedText ;

        console.log("成功")
    }

    document.getElementById("worded_text").textContent = wordedText ;
})
//誤認識なら確認を閉じ、入力を受け付ける
//また成功処理を行う


checkNButton.addEventListener("click",() => {
    result()
    descriptionPart.style.display = "none"
})
//重複時

document.getElementById("choice_word_button").addEventListener("click",() => {


    const choiceWordInput = document.getElementById("choice_word_input").value
    if (choiceWordInput === "") {
        document.getElementById("choice_word_check_text").textContent = "単語が入力されていません"
        document.getElementById("choice_word_sub").showModal() ;
    }

    else { //成功処理
        getTrueWord(choiceWordInput)

        const allWordInDescription = [] ;
        const tokens = tokenizer.tokenize(description)
        for (let i = 0 ; i <= tokens.length - 1 ; i++) {
            const tenporaryWord =
                tokens[i].basic_form === "*"
                    ? tokens[i].surface_form
                    : tokens[i].basic_form
            allWordInDescription.push(tenporaryWord)
        }

        if (checkWordByPart(allWordInDescription,trueWord.part) || description.includes(choiceWordInput)) {
            currentWord = {
            dictionaryForm : trueWord.dictionaryForm,
            reading : trueWord.reading,
            source : "manual",
            type : trueWord.type,
            split : trueWord.part
            }

            wordList.push({
                dictionaryForm : trueWord.dictionaryForm,
                reading : trueWord.reading,
                source : "manual",
                type : trueWord.type,
                split : trueWord.part
            })

            document.getElementById("choice_word_main").style.display = "none" ;
            descriptionPart.style.display = "block" ;

            currentWordText.textContent = `現在の単語 : ${currentWord.dictionaryForm}`

            document.getElementById("choice_word_input").value = ""

        
        }
        //makeChoiceButton のボタンが押されたときの処理とほぼ同じ

        else {
            document.getElementById("choice_word_check_text").textContent = `${choiceWordInput}は語釈に含まれていません`

            document.getElementById("choice_word_input").value = ""
            document.getElementById("choice_word_sub").showModal() ;
        }
    }
})
//手入力で単語を送信した際の処理

for (const button of document.querySelectorAll(".choice_word_check_button")) {
    button.addEventListener("click",() => {
        document.getElementById("choice_word_sub").close() ;
    })
}
//語釈に含まれていないことの確認ボタン
//ネタで何個かボタンを作ろうとしたからこの形
//
//返事は「はい」か「YES」


document.getElementById("replay_button").addEventListener("click",() => {
    screenReset()
    showScreen("game_screen")
    if (manualStartMode.checked) {
            document.getElementById("worded_text").textContent = "まだ説明されていません"

        descriptionPart.style.display = "none" ;
        document.getElementById("manual_start_screen").style.display = "block" ;
        //start_word_button へ
    }

    else {
        currentWord = choiceStartWord()
        resetGame()

        wordList = []
        wordList.push({
            dictionaryForm : currentWord.dictionaryForm,
            reading : currentWord.reading,
            source : "auto",
            type : currentWord.type,
            split : [currentWord.dictionaryForm]  
        })
        //send_button へ
    }
}) 
//start_buttonとおなじ
//リプレイボタンをおしたらゲームスクリーンに,リセットもする



document.getElementById("go_title_button").addEventListener("click",() => {
    showScreen("title_screen")
    

    for (const detail of detailList) {
            detail.open = false ;
        }
    
})
//タイトルに戻り
//ルールの折りたたみをすべて閉じる

document.getElementById("give_up_button").addEventListener("click",() => {
   giveDialog.showModal() ;
})
//ギブアップボタン、確認のためダイアログを挟む

document.getElementById("give_up_y").addEventListener("click",() => {
    logList.push({
        word : currentWord.dictionaryForm,
        description : "ギブアップ"
    })

    document.getElementById("no_word").textContent = `ギブアップ！`
    result()
})
//ダイアログではいを押した処理

document.getElementById("give_up_n").addEventListener("click",() => {
    giveDialog.close() ;
})
//いいえを押したら閉じるだけ

















//=========設定=========
const showWordMode = document.getElementById("show_word_mode")

const jyosi = document.getElementById("jyosi")
const jyodosi = document.getElementById("jyodousi")
const kanndousi = document.getElementById("kandousi")
const settousi = document.getElementById("settousi")
const filler = document.getElementById("filler")
const kigou = document.getElementById("kigou")
const others = document.getElementById("others")

const hinnsiBox = document.querySelectorAll(".hinnsi")

const allCheck = document.getElementById("all_check")
document.getElementById("open_setting_button").addEventListener("click",() =>{
    document.getElementById("setting_screen").style.display = "block" ;
    document.getElementById("title_screen").style.display = "none"
})
//設定を開く

document.getElementById("close_setting_button").addEventListener("click",() => {
    document.getElementById("setting_screen").style.display = "none" ;
    document.getElementById("title_screen").style.display = "block" ;

    for (const detail of detailList ) {
        detail.open = false ;
    //ルールの折りたたみをすべて閉じる
    }
})
//設定を閉じる
//ルールも閉じる

showWordMode.addEventListener("change",() => {
    if (showWordMode.checked) {
        document.getElementById("show_worded").style.display = "block" ;
    }

    else {
        document.getElementById("show_worded").style.display = "none" 
    }
})
//説明された単語の表示設定

for (let i = 0; i <= hinnsiBox.length - 1; i++) {
    hinnsiBox[i].addEventListener("change",() => {
        if (hinnsiBox[i].checked) {
            wordChoiceType[6 + i] = wordTypeAll[6 + i]
        }

        else {
            wordChoiceType[6 + i] = ""
        }
    })

}

allCheck.addEventListener("click",() => {
    let allCheched = true ;
    for (const checkBox of hinnsiBox) {
        if (checkBox.checked) {
            continue
        }

        allCheched = false ;
        break
    }

    if (allCheched) {
        for (const checkBox of hinnsiBox) {
            checkBox.checked = false ;
            checkBox.dispatchEvent(new Event("change")) ;
        }
    }

    else {
        for (const checkBox of hinnsiBox) {
            checkBox.checked = true ;
            checkBox.dispatchEvent(new Event("change")) ;
        }
    }

})
//全選択/全解除





















//==========CSS,デザイン関係==============
const descriptionArea = document.getElementById("description")//テキストエリアの大きさ変更に用いる
const content = document.getElementById("content") 
const bottomSpace = document.getElementById("bottom_space")

const detailList = document.querySelectorAll("details") //内部のを閉じるために使う
const summaryList = document.querySelectorAll("summary") 
const buttonList = document.querySelectorAll("button")
const labelList = document.querySelectorAll("label")
const dialogList = document.querySelectorAll(".footnote")

let oldHeight = content.getBoundingClientRect().height; 
let savedScrollY = 0

let programScroll = false ;
let buttonChenge = false ;

const observer = new ResizeObserver(() => {
    if (buttonChenge) {
        buttonChenge = false ;
        return
    }
    const newHeight = content.getBoundingClientRect().height ;
    const difference = oldHeight - newHeight ;//基本的に減る場合を扱うのでこの順

    if (difference > 0) {
        bottomSpace.style.height = difference + "px";
    }

    oldHeight = newHeight ;

    programScroll = true ;

    window.scrollTo(0,savedScrollY)
        

})
//高さが変わったことを検知し、その分余白を追加
//webの自動調節で目が疲れないようにするための処理

observer.observe(content)



window.addEventListener("scroll",() => {
    if (programScroll) {
        programScroll = false
        return
    }
    bottomSpace.style.height = "0px" ;
})
//ユーザーがスクロールしたら余白を削除
//急に消えるので改善の余地あり

for (const button of buttonList) {
    button.addEventListener("click",() =>
    buttonChenge = true
    )
}
//ボタンでコンテンツの高さが変わった時に、obserber が作動しないための処理

for (const summary of summaryList) {
    summary.addEventListener("click",() => {
        savedScrollY = window.scrollY
    })
}
//高さが変わった際、以前の高さを保持する


descriptionArea.addEventListener("input",() => {
    descriptionArea.style.height = "auto"
    descriptionArea.style.height = `${descriptionArea.scrollHeight + 10}px`

})
//語釈入力部の自動拡大

for (const dialog of dialogList) {
    dialog.addEventListener("click",(event) => {
        if (event.target === dialog) {
            dialog.close() ;
        }
    })
}
//ダイアログの外を押しても閉じるようにする。
//footnote タグにのみ有効

for (const detail of detailList) {
    detail.addEventListener("toggle",() => {
        
        const innerDetails = detail.querySelectorAll("details")

        for (const innerDetail of innerDetails) {
            innerDetail.open = false ;

        }
    })
}
//detiles が開閉されたら下の detiles をとじる 


document.querySelectorAll(".footnote_open_button").forEach(button => {
    button.addEventListener("click",() => {
        const number = button.dataset.footnote ;

        document.getElementById(`footnote_${number}`).showModal() ;
    })
})
//脚注を開く

document.querySelectorAll(".footnote_close_button").forEach(button => {
    button.addEventListener("click",() => {
        for (const footnote of document.querySelectorAll(".footnote"))
            footnote.close() ;
    })
})
//脚注をすべて閉じる


function scrollTop() {
    window.scrollTo(0,0)
}



/*
追加したい要素

マルチモードの実装
余白のなめらかな調整
ダークモードへの対応


*/

