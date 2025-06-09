class ImageProcessor {
    constructor() {
        this.originalImage = null;
        this.currentTab = 'resize';
        
        // キャンバス要素
        this.resizeOriginalCanvas = document.getElementById('originalCanvas');
        this.resizePreviewCanvas = document.getElementById('resizePreviewCanvas');
        this.convertOriginalCanvas = document.getElementById('convertOriginalCanvas');
        this.convertPreviewCanvas = document.getElementById('convertPreviewCanvas');
        
        // コンテキスト
        this.resizeOriginalCtx = this.resizeOriginalCanvas.getContext('2d');
        this.resizePreviewCtx = this.resizePreviewCanvas.getContext('2d');
        this.convertOriginalCtx = this.convertOriginalCanvas.getContext('2d');
        this.convertPreviewCtx = this.convertPreviewCanvas.getContext('2d');
        
        this.initializeEventListeners();
        this.initializeTabsFromURL();
    }

    initializeEventListeners() {
        // ファイル入力
        const imageInput = document.getElementById('imageInput');
        const uploadArea = document.getElementById('uploadArea');
        
        imageInput.addEventListener('change', (e) => this.handleFileSelect(e));
        uploadArea.addEventListener('click', () => imageInput.click());
        
        // ドラッグ&ドロップ
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.loadImage(files[0]);
            }
        });

        // タブ切り替え
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.target.dataset.tab;
                this.switchTab(tab);
            });
        });

        // リサイズコントロール
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        const maintainRatio = document.getElementById('maintainRatio');
        const resizeQualitySlider = document.getElementById('resizeQualitySlider');
        const resizeQualityValue = document.getElementById('resizeQualityValue');

        widthInput.addEventListener('input', () => this.handleSizeChange('width'));
        heightInput.addEventListener('input', () => this.handleSizeChange('height'));
        maintainRatio.addEventListener('change', () => this.updateResizePreview());
        resizeQualitySlider.addEventListener('input', () => {
            resizeQualityValue.textContent = `${Math.round(resizeQualitySlider.value * 100)}%`;
            this.updateResizePreview();
        });

        // 形式変換コントロール
        const outputFormat = document.getElementById('outputFormat');
        const convertQualitySlider = document.getElementById('convertQualitySlider');
        const convertQualityValue = document.getElementById('convertQualityValue');
        const backgroundColorPicker = document.getElementById('backgroundColorPicker');

        outputFormat.addEventListener('change', () => this.handleFormatChange());
        convertQualitySlider.addEventListener('input', () => {
            convertQualityValue.textContent = `${Math.round(convertQualitySlider.value * 100)}%`;
            this.updateConvertPreview();
        });
        backgroundColorPicker.addEventListener('change', () => this.updateConvertPreview());

        // ダウンロードボタン
        document.getElementById('resizeDownloadBtn').addEventListener('click', () => this.downloadResizedImage());
        document.getElementById('convertDownloadBtn').addEventListener('click', () => this.downloadConvertedImage());
    }

    initializeTabsFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        if (tab && (tab === 'resize' || tab === 'convert')) {
            this.switchTab(tab);
        }
    }

    switchTab(tabName) {
        // タブボタンの状態更新
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabName) {
                btn.classList.add('active');
            }
        });

        // タブコンテンツの表示切り替え
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName + 'Tab').classList.add('active');

        this.currentTab = tabName;

        // URLクエリパラメータを更新
        const url = new URL(window.location);
        url.searchParams.set('tab', tabName);
        window.history.replaceState({}, '', url);

        // 画像が既にロードされている場合、新しいタブに表示
        if (this.originalImage) {
            this.displayOriginalImageInCurrentTab();
            if (tabName === 'resize') {
                this.updateResizePreview();
            } else if (tabName === 'convert') {
                this.updateConvertPreview();
            }
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.loadImage(file);
        }
    }

    loadImage(file) {
        if (!file.type.startsWith('image/')) {
            alert('画像ファイルを選択してください。');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.originalImage = img;
                this.displayOriginalImageInCurrentTab();
                this.initializeControlsForCurrentTab();
                this.updatePreviewForCurrentTab();
                this.showControlsForCurrentTab();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    displayOriginalImageInCurrentTab() {
        const maxDisplaySize = 300;
        const ratio = Math.min(maxDisplaySize / this.originalImage.width, maxDisplaySize / this.originalImage.height);
        
        if (this.currentTab === 'resize') {
            this.resizeOriginalCanvas.width = this.originalImage.width * ratio;
            this.resizeOriginalCanvas.height = this.originalImage.height * ratio;
            
            this.resizeOriginalCtx.drawImage(
                this.originalImage,
                0, 0,
                this.resizeOriginalCanvas.width,
                this.resizeOriginalCanvas.height
            );

            document.getElementById('originalInfo').innerHTML = `
                <strong>サイズ:</strong> ${this.originalImage.width} × ${this.originalImage.height} px<br>
                <strong>縦横比:</strong> ${(this.originalImage.width / this.originalImage.height).toFixed(2)}
            `;
        } else if (this.currentTab === 'convert') {
            this.convertOriginalCanvas.width = this.originalImage.width * ratio;
            this.convertOriginalCanvas.height = this.originalImage.height * ratio;
            
            this.convertOriginalCtx.drawImage(
                this.originalImage,
                0, 0,
                this.convertOriginalCanvas.width,
                this.convertOriginalCanvas.height
            );

            document.getElementById('convertOriginalInfo').innerHTML = `
                <strong>サイズ:</strong> ${this.originalImage.width} × ${this.originalImage.height} px<br>
                <strong>縦横比:</strong> ${(this.originalImage.width / this.originalImage.height).toFixed(2)}
            `;
        }
    }

    initializeControlsForCurrentTab() {
        if (this.currentTab === 'resize') {
            document.getElementById('widthInput').value = this.originalImage.width;
            document.getElementById('heightInput').value = this.originalImage.height;
        }
    }

    updatePreviewForCurrentTab() {
        if (this.currentTab === 'resize') {
            this.updateResizePreview();
        } else if (this.currentTab === 'convert') {
            this.updateConvertPreview();
        }
    }

    showControlsForCurrentTab() {
        if (this.currentTab === 'resize') {
            document.getElementById('resizeControlsSection').style.display = 'block';
        } else if (this.currentTab === 'convert') {
            document.getElementById('convertControlsSection').style.display = 'block';
        }
    }

    handleSizeChange(changedDimension) {
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        const maintainRatio = document.getElementById('maintainRatio');

        if (maintainRatio.checked && this.originalImage) {
            const aspectRatio = this.originalImage.width / this.originalImage.height;
            
            if (changedDimension === 'width') {
                const newWidth = parseInt(widthInput.value) || 0;
                heightInput.value = Math.round(newWidth / aspectRatio);
            } else {
                const newHeight = parseInt(heightInput.value) || 0;
                widthInput.value = Math.round(newHeight * aspectRatio);
            }
        }

        this.updateResizePreview();
    }

    updateResizePreview() {
        const widthInput = document.getElementById('widthInput');
        const heightInput = document.getElementById('heightInput');
        const resizeQualitySlider = document.getElementById('resizeQualitySlider');

        const newWidth = parseInt(widthInput.value) || this.originalImage.width;
        const newHeight = parseInt(heightInput.value) || this.originalImage.height;
        const quality = parseFloat(resizeQualitySlider.value);

        if (newWidth <= 0 || newHeight <= 0) {
            return;
        }

        this.resizePreviewCanvas.width = newWidth;
        this.resizePreviewCanvas.height = newHeight;

        this.resizePreviewCtx.drawImage(
            this.originalImage,
            0, 0,
            newWidth,
            newHeight
        );

        const fileSizeEstimate = this.estimateFileSize(newWidth, newHeight, quality);
        document.getElementById('resizePreviewInfo').innerHTML = `
            <strong>サイズ:</strong> ${newWidth} × ${newHeight} px<br>
            <strong>縦横比:</strong> ${(newWidth / newHeight).toFixed(2)}<br>
            <strong>推定ファイルサイズ:</strong> ${fileSizeEstimate}
        `;
    }

    handleFormatChange() {
        const outputFormat = document.getElementById('outputFormat');
        const convertQualityGroup = document.getElementById('convertQualityGroup');

        // PNGの場合は品質設定を無効化
        if (outputFormat.value === 'png') {
            convertQualityGroup.style.display = 'none';
        } else {
            convertQualityGroup.style.display = 'block';
        }

        this.updateConvertPreview();
    }

    updateConvertPreview() {
        if (!this.originalImage) return;

        const outputFormat = document.getElementById('outputFormat');
        const convertQualitySlider = document.getElementById('convertQualitySlider');
        const backgroundColorPicker = document.getElementById('backgroundColorPicker');

        const format = outputFormat.value;
        const quality = parseFloat(convertQualitySlider.value);
        const backgroundColor = backgroundColorPicker.value;

        // プレビューキャンバスを元のサイズに設定
        this.convertPreviewCanvas.width = this.originalImage.width;
        this.convertPreviewCanvas.height = this.originalImage.height;

        // 背景色を設定（JPEG変換時）
        if (format === 'jpeg') {
            this.convertPreviewCtx.fillStyle = backgroundColor;
            this.convertPreviewCtx.fillRect(0, 0, this.convertPreviewCanvas.width, this.convertPreviewCanvas.height);
        } else {
            this.convertPreviewCtx.clearRect(0, 0, this.convertPreviewCanvas.width, this.convertPreviewCanvas.height);
        }

        // 画像を描画
        this.convertPreviewCtx.drawImage(
            this.originalImage,
            0, 0,
            this.originalImage.width,
            this.originalImage.height
        );

        // プレビュー情報を更新
        const mimeType = this.getMimeType(format);
        const dataURL = this.convertPreviewCanvas.toDataURL(mimeType, quality);
        const estimatedSize = Math.round(dataURL.length * 0.75); // Base64のオーバーヘッドを考慮

        document.getElementById('convertPreviewInfo').innerHTML = `
            <strong>形式:</strong> ${format.toUpperCase()}<br>
            <strong>サイズ:</strong> ${this.originalImage.width} × ${this.originalImage.height} px<br>
            <strong>推定ファイルサイズ:</strong> ${this.formatFileSize(estimatedSize)}
        `;
    }

    getMimeType(format) {
        switch (format) {
            case 'jpeg': return 'image/jpeg';
            case 'png': return 'image/png';
            case 'webp': return 'image/webp';
            default: return 'image/jpeg';
        }
    }

    getFileExtension(format) {
        switch (format) {
            case 'jpeg': return 'jpg';
            case 'png': return 'png';
            case 'webp': return 'webp';
            default: return 'jpg';
        }
    }

    estimateFileSize(width, height, quality) {
        const pixels = width * height;
        const baseSize = pixels * 0.5;
        const qualityFactor = quality;
        const estimatedBytes = baseSize * qualityFactor;
        
        return this.formatFileSize(estimatedBytes);
    }

    formatFileSize(bytes) {
        if (bytes < 1024) {
            return `${Math.round(bytes)} B`;
        } else if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        } else {
            return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
        }
    }

    downloadResizedImage() {
        const resizeQualitySlider = document.getElementById('resizeQualitySlider');
        const quality = parseFloat(resizeQualitySlider.value);
        
        const dataURL = this.resizePreviewCanvas.toDataURL('image/jpeg', quality);
        
        const link = document.createElement('a');
        link.download = `resized_image_${this.resizePreviewCanvas.width}x${this.resizePreviewCanvas.height}.jpg`;
        link.href = dataURL;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    downloadConvertedImage() {
        const outputFormat = document.getElementById('outputFormat');
        const convertQualitySlider = document.getElementById('convertQualitySlider');
        
        const format = outputFormat.value;
        const quality = parseFloat(convertQualitySlider.value);
        const mimeType = this.getMimeType(format);
        const extension = this.getFileExtension(format);
        
        let dataURL;
        if (format === 'png') {
            dataURL = this.convertPreviewCanvas.toDataURL(mimeType);
        } else {
            dataURL = this.convertPreviewCanvas.toDataURL(mimeType, quality);
        }
        
        const link = document.createElement('a');
        link.download = `converted_image_${this.originalImage.width}x${this.originalImage.height}.${extension}`;
        link.href = dataURL;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    new ImageProcessor();
});

// PWA対応（Service Worker）
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
} 
