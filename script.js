const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const photo = document.getElementById('photo');
const frameImg = document.getElementById('overlay-frame');
const snapBtn = document.getElementById('snap-btn');
const resultBtns = document.getElementById('result-btns');
const retakeBtn = document.getElementById('retake-btn');
const saveBtn = document.getElementById('save-btn');

// 启动摄像头
async function initCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: { facingMode: "environment" } // 优先后置
        });
        video.srcObject = stream;
    } catch (err) {
        alert("无法启动摄像头，请确保使用HTTPS链接访问。");
    }
}

// 拍照逻辑
snapBtn.addEventListener('click', () => {
    // 1. 设置画布尺寸
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // 2. 绘制视频底图
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 3. 绘制 Base64 的相框
    // 即使是Base64，浏览器也把它当作普通图片对象处理
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 4. 生成最终图片
    photo.src = canvas.toDataURL('image/png');

    // 5. 切换显示
    video.style.display = 'none';
    frameImg.style.display = 'none';
    photo.style.display = 'block';
    
    snapBtn.style.display = 'none';
    resultBtns.style.display = 'block';
});

// 重拍逻辑
retakeBtn.addEventListener('click', () => {
    photo.style.display = 'none';
    video.style.display = 'block';
    frameImg.style.display = 'block';
    snapBtn.style.display = 'block';
    resultBtns.style.display = 'none';
});

saveBtn.addEventListener('click', () => {
    alert("请长按图片保存");
});

window.addEventListener('load', initCamera);