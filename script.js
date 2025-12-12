const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photoResult = document.getElementById('photo-result');
const startBtn = document.getElementById('start-btn');
const retakeBtn = document.getElementById('retake-btn');
const saveBtn = document.getElementById('save-btn');
const resultControls = document.getElementById('result-controls');
const countdownDisplay = document.getElementById('countdown-display');
// 注意：这里我们获取的是图片元素
const frameImg = document.getElementById('frame-img'); 
const qrImg = document.getElementById('qr-hidden');

// 1. 初始化摄像头
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: "user", // "user" 前置
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }, 
            audio: false 
        });
        video.srcObject = stream;
    } catch (err) {
        alert("无法调用摄像头: " + err.message + "\n请确保使用HTTPS或localhost，并允许摄像头权限。");
    }
}

// 2. 倒计时拍摄逻辑
startBtn.addEventListener('click', () => {
    let count = 3;
    startBtn.style.display = 'none'; 
    countdownDisplay.style.display = 'block';
    countdownDisplay.innerText = count;

    const timer = setInterval(() => {
        count--;
        if (count > 0) {
            countdownDisplay.innerText = count;
        } else {
            clearInterval(timer);
            countdownDisplay.style.display = 'none';
            takePhoto();
        }
    }, 1000);
});

// 3. 拍照功能 (合成：人像 + 框 + 二维码)
function takePhoto() {
    // 设置画布尺寸与视频一致
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const context = canvas.getContext('2d');
    
    // --- 步骤 A: 绘制摄像头画面 ---
    // 技巧：为了让保存的照片也像镜子一样，我们需要水平翻转画布
    context.save(); // 保存当前状态
    context.translate(canvas.width, 0);
    context.scale(-1, 1); // 水平翻转
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    context.restore(); // 恢复状态，避免影响后续绘制
    
    // --- 步骤 B: 绘制拍照框 ---
    // 将 frame.png 拉伸覆盖在全图上
    context.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // --- 步骤 C: 绘制二维码 (右下角) ---
    // 1. 设定二维码大小 (例如：占总宽度的 18%)
    const qrWidth = canvas.width * 0.18;
    const qrHeight = qrWidth; // 保持正方形
    
    // 2. 设定位置 (右下角，留出 20px 边距)
    const margin = 20; 
    const qrX = canvas.width - qrWidth - margin;
    const qrY = canvas.height - qrHeight - margin;

    // 3. 绘制
    context.drawImage(qrImg, qrX, qrY, qrWidth, qrHeight);
    
    // --- 步骤 D: 生成最终图片 ---
    const dataUrl = canvas.toDataURL('image/png');
    photoResult.src = dataUrl;
    
    // 切换UI状态
    photoResult.style.display = 'block';
    frameImg.style.display = 'none'; // 拍照后隐藏原来的框，因为照片里已经有了
    resultControls.style.display = 'flex';
}

// 4. 重新拍摄
retakeBtn.addEventListener('click', () => {
    photoResult.style.display = 'none';
    frameImg.style.display = 'block'; // 重新显示预览框
    resultControls.style.display = 'none';
    startBtn.style.display = 'block';
    photoResult.src = ""; 
});

// 5. 长按保存逻辑
let pressTimer;

saveBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    pressTimer = setTimeout(() => {
        downloadImage();
    }, 800);
});

saveBtn.addEventListener('touchend', () => {
    clearTimeout(pressTimer);
});

saveBtn.addEventListener('click', () => {
    downloadImage(); 
});

function downloadImage() {
    const dataUrl = photoResult.src;
    if (!dataUrl) return;

    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'photo_' + new Date().getTime() + '.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert("如果未自动下载，请长按屏幕中间的图片选择'保存到手机'。");
}

// 启动
initCamera();