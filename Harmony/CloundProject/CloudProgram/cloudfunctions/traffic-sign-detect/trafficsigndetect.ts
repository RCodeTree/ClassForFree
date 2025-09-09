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
  error: {
    message: string;
  };
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

  let trafficSignInfo = '';
  try {
    trafficSignInfo = await callZhiPuAI(requestData);
  } catch (error) {
    logger.error('Error: ', error);
  }


  callback({
    code: 0,
    desc: `交通标识识别成功，结果为：${trafficSignInfo} `
  });
};

// 调用智谱AI接口
async function callZhiPuAI(reqData: string): Promise<string> {
  const api_key = "02e9ab6ba0764c9382814bccbf25c5fd.iJY1OVl6MRy4aYnC";
  let apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

  // 请求头
  const options = {
    port: 443,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${api_key}`,
    },
    timeout: 30000
  };

  // 调用智谱AI接口，拿到响应结果
  const responseData = await new Promise<string>((resolve, reject) => {
    const req = https.request(apiUrl, options, (res) => {
      res.setEncoding('utf8');
      console.info('response: ' + JSON.stringify(res));


      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(rawData);
        } else {
          reject(new Error(`请求失败，状态码: ${res.statusCode}, 响应: ${res.statusMessage}`));
        }
      });

    });


    req.on('error', (error) => {
      reject(error);
    })

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    })

    req.write(reqData);
    req.end();

  });


  // 解析响应结果
  const response: ZhiPuAiResponse = JSON.parse(responseData);
  if (response.error) {
    throw new Error("智谱AI接口错误，" + response.error.message);
  }

  const firstChoice = response.choice[0];
  if (!firstChoice.message || !firstChoice.message.content) {
    throw new Error("智谱AI响应格式异常，缺少message或content字段");
  }

  return firstChoice.message.content;
}


export {
  myHandler
};