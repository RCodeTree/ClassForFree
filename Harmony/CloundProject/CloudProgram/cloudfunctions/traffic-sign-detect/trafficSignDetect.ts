import https from 'https';

// 定义智谱AI API响应类型
interface ZhiPuAIResponse {
  id: string;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  error?: {
    message: string;
    type: string;
    code?: string;
  };
}


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

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(data);
        } else {
          reject(new Error(`请求失败，状态码: ${res.statusCode}, 响应: ${data}`));
        }
      });


      // 获取返回结果
      req.on('error', (err) => {
        logger.error('请求错误：' + err.message)
        reject(err);
      });

      req.on('timeout', () => {
        logger.error('请求超时')
        req.destroy(); // 销毁请求
        reject(new Error('请求超时'));
      });

      req.end(); // 结束请求
    });
  });


  // 识别解析结果
  const response: ZhiPuAIResponse = JSON.parse(responseData); // 解析返回结果
  logger.info("接口调用成功, 返回结果：" + JSON.stringify(response));
  if (response.error) {
    throw new Error("接口调用异常, 错误信息：" + response.error.message);
  }

  const firstChoice = response.choices[0];
  if (!firstChoice.message || !firstChoice.message.content) {
    throw new Error("接口调用异常, 返回结果中缺少内容");
  }

  const trafficSignInfo = firstChoice.message.content;


  callback({
    code: 0,
    desc: `交通标识识别成功，结果为： ${trafficSignInfo}`
  });
};

export { myHandler };