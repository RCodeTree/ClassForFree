import https from 'https';

let myHandler = async function (event, context, callback, logger) {
  logger.info("收到请求事件：" + JSON.parse(event));

  /*
     do something here
   */
  const body = JSON.parse(event.body);
  const imageUrl = "";


  // 获取大模型 API KEY
  const api_key = "02e9ab6ba0764c9382814bccbf25c5fd.iJY1OVl6MRy4aYnC";

  // 构建请求数据
  const requestData = JSON.stringify({
    model: "GLM_4V_Flash", //模型名称
    message: [
      {
        role: "user",
        content: [
          {
            "type": "text",
            "text": "请分析这张图片中的交通标志"
          },
          {
            "type": "image_url",
            "image_url": {
              "url": imageUrl
            }
          }
        ]
      }
    ]
  });

  // 构建请求选项
  const apiUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
  const urlParts = new URL(apiUrl);
  const options = {
    hostname: urlParts.hostname,
    port: 443,
    path: urlParts.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + api_key,
      'Content-Length': Buffer.byteLength(requestData),
      'Accept-Charset': 'utf-8'
    },
    timeout: 30000
  };


  // 调用接口
  const responseData = await new Promise<string>((resolve, reject) => {
    // 调用接口
    const req = https.request(options, (res) => {
      res.setEncoding('utf8'); // 设置编码
      let data = '';
      res.on('data', (chunk) => {
        data += chunk; // 接收数据，构造返回结果
      });
    });


  });


  callback({
    code: 0,
    // desc: `Hello ${reqName}`
  });
};

export { myHandler };