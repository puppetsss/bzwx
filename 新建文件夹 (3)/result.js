// result.js - 结果页JavaScript逻辑

async function main() {
    const params = new URLSearchParams(window.location.search);
    
    const apiKey = params.get('apiKey');
    const bazi = params.get('bazi');
    const gender = params.get('gender');
    
    document.getElementById('baziMeta').innerHTML = `
        <span>八字 · ${bazi}</span>
        <span>性别 · ${gender}</span>
        <span>真太阳时 · ${params.get('trueYear')}-${params.get('trueMonth')}-${params.get('trueDay')} ${params.get('trueHour')}:${params.get('trueMinute')}</span>
        <span>出生地 · ${params.get('province')} ${params.get('city')} ${params.get('district')}</span>
    `;

    // 哲学爽文风提示词
    const systemPrompt = `你是一位融合了博尔赫斯、加缪、卡尔维诺风格的作家，擅长将命理转化为有哲学深度的爽文。

【核心定位】
- 有哲学思辨，但不晦涩
- 有爽文节奏，但不无脑
- 有命运重量，但不绝望

【开篇要求】
- 第一句：像格言，像咒语，让人想划线
- 第一段：抛出命运的矛盾、选择的悖论

【爽点设计】
- 顿悟爽：突然想通了某个困扰半生的事
- 反转爽：一直以为是诅咒的，其实是礼物
- 时间爽：放在宇宙尺度下，小事变史诗

【金句密度】
- 每段至少一句值得划线的句子

【人物命运】
- 有遗憾，但那是选择的代价，不是失败
- 有失去，但那是交换的结果，不是悲剧

【输出格式】
小说名：
扉页题词：
人物小传：
命运关键词：
简介正文：
书摘片段：
作者注：
命理解读：`;

    const userPrompt = `八字：${bazi}
性别：${gender}

请生成。`;

    try {
        const response = await fetch('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'qwen-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0.75,
                max_tokens: 3500
            })
        });

        const data = await response.json();
        if (data.choices && data.choices[0]) {
            const content = data.choices[0].message.content;
            
            // 提取函数
            const extract = (title) => {
                const regex = new RegExp(title + '[：:]?\\s*([\\s\\S]+?)(?=\\n\\s*[\\u4e00-\\u9fa5]{2,8}[:：]|$)', 'i');
                const match = content.match(regex);
                return match ? match[1].trim() : '';
            };

            // 小说名
            let novelName = extract('小说名') || '迷宫';
            novelName = novelName.replace(/[《》]/g, '').split('\n')[0].trim();
            document.getElementById('novelName').textContent = novelName;
            
            document.getElementById('epigraph').innerHTML = extract('扉页题词') || '“你寻找的出口，是你进来的地方。”';
            
            const keywords = extract('命运关键词') || '镜子 · 迷宫 · 无限 · 岔路 · 回音';
            document.getElementById('keywords').innerHTML = keywords.split(/[·、,，]/).map(k => 
                `<span class="keyword-tag">${k.trim()}</span>`
            ).join('');
            
            document.getElementById('sketch').innerHTML = extract('人物小传') || '他一生都在寻找一把钥匙，后来发现门在自己里面。';
            
            const desc = extract('简介正文') || '';
            document.getElementById('novelDesc').innerHTML = desc.split('\n').map(p => 
                p.trim() ? `<p>${p}</p>` : ''
            ).join('');
            
            document.getElementById('excerpt').innerHTML = extract('书摘片段') || '“他走遍了所有岔路，才发现迷宫没有出口，只有入口。”';
            
            document.getElementById('authorNote').innerHTML = extract('作者注') || '八字中的冲刑，化作了命运的岔路。';
            
            const analysis = extract('命理解读') || '';
            document.getElementById('analysis').innerHTML = analysis.split('\n').map(p => 
                p.trim() ? `<p>${p}</p>` : ''
            ).join('');
            
            document.getElementById('loading').style.display = 'none';
            document.getElementById('content').style.display = 'block';
        }
    } catch (error) {
        document.getElementById('loading').innerHTML = `
            <div class="spinner"></div>
            <div style="color: #ff6b6b; margin: 16px;">生成未竟：${error.message}</div>
            <a href="index.html" style="color:#9d7bf5;">← 返回重试</a>
        `;
    }
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', main);