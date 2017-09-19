const rp = require('request-promise')
const cheerio = require('cheerio')
const MongoClient = require('mongodb').MongoClient
const htmlDecode = require('./htmlDecode')

async function main(id) {
    let url = 'mongodb://localhost:27017/zhihu';
    let db = await MongoClient.connect(url);
    await getQuestion(db, id)
}
async function getQuestion(db, id) {
    let res = await rp(`https://www.zhihu.com/question/${id}`)
    let $ = cheerio.load(res)
    // 知乎用react写的 redux数据放在id为data属性为data-state中
    let data = $('#data').attr('data-state')
    // 处理转义符 解析数据 获取json对象
    let state = JSON.parse(htmlDecode(data))
    // 获取问题对象
    let question = state.entities.questions[id]
    //插入mongodb
    db.collection("questions").insert(question)
    console.log(question.answerCount)
    // question.answerCount为问题回答数 调用获取回答函数
    await getAnswers(db, id, question.answerCount)
}
async function getAnswers(db, id, answerCount) {
    for (let offset = 0; offset < answerCount; offset += 20) {
        let res = await rp({
            url: `https://www.zhihu.com/api/v4/questions/${id}/answers?sort_by=default&include=data%5B%2A%5D.is_normal%2Cadmin_closed_comment%2Creward_info%2Cis_collapsed%2Cannotation_action%2Cannotation_detail%2Ccollapse_reason%2Cis_sticky%2Ccollapsed_by%2Csuggest_edit%2Ccomment_count%2Ccan_comment%2Ccontent%2Ceditable_content%2Cvoteup_count%2Creshipment_settings%2Ccomment_permission%2Ccreated_time%2Cupdated_time%2Creview_info%2Cquestion%2Cexcerpt%2Crelationship.is_authorized%2Cis_author%2Cvoting%2Cis_thanked%2Cis_nothelp%2Cupvoted_followees%3Bdata%5B%2A%5D.mark_infos%5B%2A%5D.url%3Bdata%5B%2A%5D.author.follower_count%2Cbadge%5B%3F%28type%3Dbest_answerer%29%5D.topics&limit=20&offset=${offset}`,
            headers: {
                authorization: 'oauth c3cef7c66a1843f8b3a9e6a1e3160e20',
            },
        })
        let answers = JSON.parse(res).data
        db.collection("answers").insertMany(answers)
    }
}
main(22132862).catch(e=>console.log(e))
