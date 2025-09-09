import https from 'https';

interface ImageURL {
  url: string;
}

interface ContentItem {
  type: string;
  text?: string;
  image_url?: ImageURL;
}

interface ChatMessage {
  role: string;
  content: ContentItem[];
}

interface ZhipuAIRequest {
  model: string;
  messages: ChatMessage[];
}

interface ResponseContentItem {
  role: string;
  content: string;
}

interface Choice {
  index: number;
  finish_reason: string;
  message: ResponseContentItem;
}

interface ZhipuAIResponse {
  id: string;
  model: string;
  choices: Choice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

let myHandler = async function (event: any, context: any, callback: Function, logger: any) {
  logger.info('收到请求事件：' + JSON.stringify(event));

  try {
    const imageUrl = event.imageUrl || 'https://b0.bdstatic.com/0083ee2a836306c4d71216df246ab789.jpg';
    const api_key = '03edf5d608e7472192b5079245df109c.TF6KYhFplkfAnhOz';

    const requestData: ZhipuAIRequest = {
      model: 'GLM-4V-Flash',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: '请分析这张图片中的交通标识' },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ]
    };

    const response = await callZhipuAI(requestData, api_key);

    if (!response.choices || response.choices.length === 0) {
      throw new Error('API响应中未找到有效的识别结果');
    }

    const result = response.choices[0].message.content;
    callback({
      code: 0,
      data: {
        description: result,
        usage: response.usage
      }
    });
  } catch (error) {
    logger.error('处理失败:', error);
    callback({
      code: -1,
      message: error.message
    });
  }
};

function callZhipuAI(reqData: ZhipuAIRequest, apiKey: string): Promise<ZhipuAIResponse> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(reqData);
    const options = {
      hostname: 'open.bigmodel.cn',
      port: 443,
      path: '/api/paas/v4/chat/completions',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let rawData = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => rawData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(rawData));
        } else {
          reject(new Error(`API请求失败: ${res.statusCode} - ${rawData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

export { myHandler };