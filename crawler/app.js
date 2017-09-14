const fs = require('fs')
const url = require('url')
const rp = require('request-promise')
const cheerio = require('cheerio')
const down = require('./do')
// const downloadImage = require('./download-image')
const htmlDecode = require('./htmlDecode')
const id = require('./config')

/**
 * 获取问题函数
 * @param {number} id
 */
async function getQuestion(id) {
  let res = await rp(`https://www.zhihu.com/question/${id}`)
  let $ = cheerio.load(res)
  // 知乎用react写的 redux数据放在id为data属性为data-state中
  let data = $('#data').attr('data-state')
  // 处理转义符 解析数据 获取json对象
  let state = JSON.parse(htmlDecode(data))
  // 获取问题对象
  let question = state.entities.questions[id]
  // question.answerCount为问题回答数 调用获取回答函数
  await getAnswers(id, question.answerCount)
}

/**
 * 获取答案函数 因为涉及异步 所以直接将下载扔这里了
 * @param {number} id
 * @param {number} answerCount
 */
async function getAnswers(id, answerCount) {
  for (let offset = 0; offset < answerCount; offset += 20) {
    let res = await rp({
      url: `https://www.zhihu.com/api/v4/questions/${id}/answers?sort_by=default&include=data%5B%2A%5D.is_normal%2Cadmin_closed_comment%2Creward_info%2Cis_collapsed%2Cannotation_action%2Cannotation_detail%2Ccollapse_reason%2Cis_sticky%2Ccollapsed_by%2Csuggest_edit%2Ccomment_count%2Ccan_comment%2Ccontent%2Ceditable_content%2Cvoteup_count%2Creshipment_settings%2Ccomment_permission%2Ccreated_time%2Cupdated_time%2Creview_info%2Cquestion%2Cexcerpt%2Crelationship.is_authorized%2Cis_author%2Cvoting%2Cis_thanked%2Cis_nothelp%2Cupvoted_followees%3Bdata%5B%2A%5D.mark_infos%5B%2A%5D.url%3Bdata%5B%2A%5D.author.follower_count%2Cbadge%5B%3F%28type%3Dbest_answerer%29%5D.topics&limit=20&offset=${offset}`,
      headers: {
        authorization: 'oauth c3cef7c66a1843f8b3a9e6a1e3160e20',
      },
    })
    // 获取到answer
    let answers = JSON.parse(res).data
    // 调用下载图片函数
    answers.forEach(function (v) {
      // 处理noscript
      let content = v.content.replace(/\<noscript\>/g, '').
        replace(/\<\/noscript\>/g, '')
      // 解析内容 获取图片链接
      let $ = cheerio.load(content)
      $('img').map((i, elem) => {
        let src = $(elem).attr('data-original')
        if (src) {
          // 解析图片链接 获取文件名字
          let filename = url.parse(src).pathname.replace(/\//, '')
          // 下载图片
          down(src, `./images/${id}/${filename}`)
        }
      })
    })
  }
  console.log(`Finished`)
}

/**
 * 创建该次main函数运行保存文件夹
 * @param {number} id
 */
async function mkdir(id) {
  let dir = {
    outerdir: `./images`,
    innerdir: `./images/${id}`,
  }
  Object.keys(dir).forEach(v => {
    if (!fs.existsSync(dir[v])) fs.mkdirSync(dir[v])
  })
}

/**
 * 文件入口函数
 * @param {number} id
 */
async function main(id) {
  if (Object.prototype.toString.call(id) !== '[object Number]') {
    console.log('Input id isn\'t a number,Can\'t run app.js')
    return
  }
  await mkdir(id)
  await getQuestion(id)
}

main(id)

