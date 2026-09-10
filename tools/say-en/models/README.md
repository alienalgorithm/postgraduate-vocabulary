# 模型

**这两个文件已经在包里了，不用下载。**

    kokoro-v1.0.onnx     310 MB    合成模型
    voices-v1.0.bin       27 MB    四种音色的向量

核对一下（可选）：

    md5sum kokoro-v1.0.onnx    应为 9579b435abd94a5af3d00d3cd39df548
    md5sum voices-v1.0.bin     应为 29895103243c07818862043c051e1db0

对不上说明解压出错了，重新解压一次。

## 万一要重新下载

    curl -L -O https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
    curl -L -O https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin

来源：https://github.com/thewh1teagle/kokoro-onnx
底层模型 Kokoro-82M，Apache 2.0 许可。
