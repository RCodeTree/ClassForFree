import * as https from 'https';

interface ImageURL {
  url: string;
}

interface ContentItem {
  type: string; // 内容类型：文本、图片
  text?: string; // 文本内容
  image_url: ImageURL; // 图片链接
}

interface ChatMessage {
  role: string; // 角色
  content: ContentItem[]; // 多模态内容数组
}


// 定义智谱AI API请求类型
interface ZhiPuAIRequest {
  model: string; // 模型名称
  messages: ChatMessage[]; // 消息列表

}


interface ResponseContentItem {
  role: string;
  content: string;
}


interface Choice {
  index: number;
  finish_reason: string; // 终止原因
  message: ResponseContentItem; // 推理结果
}

// 定义智谱AI API响应类型
interface ZhiPuAiResponse {
  id: string; // 任务ID
  model: string; // 模型名称
  choice: Choice[]; // 当前对话中输出的内容
}


/*
 HarmonyOS 云函数
 */
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
            type: "text",
            text: "请分析这张图片中的交通标志"
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl
            }
          }
        ]
      }
    ]
  });

  let reqDataObj: ZhiPuAIRequest = JSON.parse(requestData) as ZhiPuAIRequest;
  let trafficSignInfo: string = '';


  const response = await callZhiPuAI(reqDataObj)
    .then((response) => {
      logger.info("response: " + JSON.stringify(response));

      let responseData: ZhiPuAiResponse;


      if (typeof response === "string") {
        responseData = JSON.parse(response) as ZhiPuAiResponse;
      }

      /*
        检查响应结构
      */
      if (!responseData.choice) {
        throw new Error("API响应格式异常，缺少choice字段");
      }

      if (responseData.choice.length === 0) {
        throw new Error("API响应中未找到有效的识别结果");
      }


      /*
        获取识别结果
      */
      const firstChoice = responseData.choice[0];
      if (!firstChoice.message || !firstChoice.message.content) {
        throw new Error("API响应格式异常，缺少message或content字段");
      }

      trafficSignInfo = firstChoice.message.content;

    })


  /*// 构建请求选项
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
    timeout: 30000,
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
          logger.error('请求失败，状态码：' + res.statusCode)
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

  const trafficSignInfo = firstChoice.message.content;*/


  callback({
    code: 0,
    desc: `交通标识识别成功，结果为：${trafficSignInfo} `
  });
};

// 调用智谱AI接口
function callZhiPuAI(reqData: ZhiPuAIRequest): Promise<ZhiPuAiResponse> {
  const api_key = "02e9ab6ba0764c9382814bccbf25c5fd.iJY1OVl6MRy4aYnC";
  let apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  const urlParts = new URL(apiUrl);
  const options = {
    hostname: urlParts.hostname,
    port: 443,
    path: urlParts.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${api_key}`,
      'Content-Length': Buffer.byteLength(JSON.stringify(reqData)),
      'Accept-Charset': 'UTF-8'
    },
    timeout: 30000,

  };


  return new Promise<ZhiPuAiResponse>((resolve, reject) => {
    https.request(apiUrl, options, (res) => {
      res.setEncoding('utf8');
      console.info('response: ' + JSON.stringify(res));

      res.on('end', () => {
        if (res.statusCode === 200) {
          let result: ZhiPuAiResponse = JSON.parse(res.statusMessage) as ZhiPuAiResponse;
          resolve(result);
        } else {
          reject(new Error(`请求失败，状态码: ${res.statusCode}, 响应: ${res.statusMessage}`));
        }

      });
    })
  });

}


export {
  myHandler
};