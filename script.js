class ImageProcessor {
    constructor() {
        this.originalImage = null;
        this.currentTab = 'resize';
        
        // キャンバス要素
        this.resizeOriginalCanvas = document.getElementById('originalCanvas');
        this.resizePreviewCanvas = document.getElementById('resizePreviewCanvas');
        this.convertOriginalCanvas = document.getElementById('convertOriginalCanvas');
        this.convertPreviewCanvas = document.getElementById('convertPreviewCanvas');
        this.backgroundOriginalCanvas = document.getElementById('backgroundOriginalCanvas');
        this.backgroundPreviewCanvas = document.getElementById('backgroundPreviewCanvas');
        
        // コンテキスト
        this.resizeOriginalCtx = this.resizeOriginalCanvas.getContext('2d');
        this.resizePreviewCtx = this.resizePreviewCanvas.getContext('2d');
        this.convertOriginalCtx = this.convertOriginalCanvas.getContext('2d');
        this.convertPreviewCtx = this.convertPreviewCanvas.getContext('2d');
        this.backgroundOriginalCtx = this.backgroundOriginalCanvas.getContext('2d');
        this.backgroundPreviewCtx = this.backgroundPreviewCanvas.getContext('2d');
        
        // MediaPipe関連
        this.selfieSegmentation = null;
        this.segmentationResults = null;
        
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

        // 背景除去コントロール
        const processBackgroundBtn = document.getElementById('processBackgroundBtn');
        const backgroundMode = document.getElementById('backgroundMode');
        const newBackgroundColor = document.getElementById('newBackgroundColor');
        const blurIntensity = document.getElementById('blurIntensity');
        const blurIntensityValue = document.getElementById('blurIntensityValue');

        processBackgroundBtn.addEventListener('click', () => this.processBackgroundRemoval());
        backgroundMode.addEventListener('change', () => this.handleBackgroundModeChange());
        newBackgroundColor.addEventListener('change', () => this.updateBackgroundPreview());
        blurIntensity.addEventListener('input', () => {
            blurIntensityValue.textContent = `${blurIntensity.value}px`;
            this.updateBackgroundPreview();
        });

        // ダウンロードボタン
        document.getElementById('resizeDownloadBtn').addEventListener('click', () => this.downloadResizedImage());
        document.getElementById('convertDownloadBtn').addEventListener('click', () => this.downloadConvertedImage());
        document.getElementById('backgroundDownloadBtn').addEventListener('click', () => this.downloadBackgroundRemovedImage());
    }

    initializeTabsFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        if (tab && (tab === 'resize' || tab === 'convert' || tab === 'background')) {
            this.switchTab(tab);
        }
    }

    async initializeMediaPipe() {
        if (this.selfieSegmentation) {
            return; // 既に初期化済み
        }

        try {
            // MediaPipeライブラリの読み込み確認
            if (typeof SelfieSegmentation === 'undefined') {
                console.log('MediaPipeライブラリの読み込み待機中...');
                try {
                    await this.waitForMediaPipe();
                } catch (waitError) {
                    console.error('MediaPipe待機エラー:', waitError);
                    throw new Error('MediaPipeライブラリが読み込まれませんでした。ページを再読み込みしてください。');
                }
            }

            console.log('MediaPipe Selfie Segmentation初期化開始...');
            
            this.selfieSegmentation = new SelfieSegmentation({
                locateFile: (file) => {
                    return `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation@0.1.1675465747/${file}`;
                }
            });

            this.selfieSegmentation.setOptions({
                modelSelection: 1, // より精度の高いモデル
            });

            this.selfieSegmentation.onResults((results) => {
                console.log('セグメンテーション結果を受信:', results);
                console.log('結果オブジェクトのキー:', Object.keys(results));
                console.log('segmentationMask:', results.segmentationMask);
                
                // セグメンテーションマスクの存在確認
                if (results.segmentationMask) {
                    console.log('マスクの詳細:', {
                        width: results.segmentationMask.width,
                        height: results.segmentationMask.height,
                        constructor: results.segmentationMask.constructor.name
                    });
                    this.segmentationResults = results;
                    this.hideProcessingStatus();
                    this.updateBackgroundPreview();
                } else {
                    console.error('セグメンテーションマスクが見つかりません');
                    console.error('利用可能なプロパティ:', Object.keys(results));
                    this.hideProcessingStatus();
                    alert('セグメンテーション処理に失敗しました。別の画像を試してください。');
                }
            });

            console.log('MediaPipe Selfie Segmentation初期化完了');
            return true;
        } catch (error) {
            console.error('MediaPipe初期化エラー:', error);
            alert('背景除去機能の初期化に失敗しました。ページを再読み込みしてお試しください。');
            return false;
        }
    }

    waitForMediaPipe() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5秒間待機
            
            const checkInterval = setInterval(() => {
                attempts++;
                console.log(`MediaPipe読み込み確認中... (${attempts}/${maxAttempts})`);
                
                if (typeof SelfieSegmentation !== 'undefined') {
                    console.log('MediaPipeライブラリが利用可能になりました');
                    clearInterval(checkInterval);
                    resolve();
                } else if (attempts >= maxAttempts) {
                    console.error('MediaPipeライブラリの読み込みがタイムアウトしました');
                    clearInterval(checkInterval);
                    reject(new Error('MediaPipeライブラリの読み込みに失敗しました'));
                }
            }, 100);
        });
    }

    showProcessingStatus() {
        const processBtn = document.getElementById('processBackgroundBtn');
        const processingStatus = document.getElementById('processingStatus');
        
        processBtn.disabled = true;
        processBtn.textContent = '処理中...';
        processingStatus.style.display = 'flex';
    }

    hideProcessingStatus() {
        const processBtn = document.getElementById('processBackgroundBtn');
        const processingStatus = document.getElementById('processingStatus');
        
        processBtn.disabled = false;
        processBtn.textContent = '🚀 背景除去を実行';
        processingStatus.style.display = 'none';
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
            } else if (tabName === 'background') {
                this.initializeMediaPipe();
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
        } else if (this.currentTab === 'background') {
            this.backgroundOriginalCanvas.width = this.originalImage.width * ratio;
            this.backgroundOriginalCanvas.height = this.originalImage.height * ratio;
            
            this.backgroundOriginalCtx.drawImage(
                this.originalImage,
                0, 0,
                this.backgroundOriginalCanvas.width,
                this.backgroundOriginalCanvas.height
            );

            document.getElementById('backgroundOriginalInfo').innerHTML = `
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
        } else if (this.currentTab === 'background') {
            this.initializeMediaPipe();
        }
    }

    showControlsForCurrentTab() {
        if (this.currentTab === 'resize') {
            document.getElementById('resizeControlsSection').style.display = 'block';
        } else if (this.currentTab === 'convert') {
            document.getElementById('convertControlsSection').style.display = 'block';
        } else if (this.currentTab === 'background') {
            document.getElementById('backgroundControlsSection').style.display = 'block';
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

    async processBackgroundRemoval() {
        if (!this.originalImage) {
            alert('画像をアップロードしてください。');
            return;
        }

        try {
            // MediaPipeの初期化確認
            if (!this.selfieSegmentation) {
                console.log('MediaPipeを初期化します...');
                this.showProcessingStatus();
                const success = await this.initializeMediaPipe();
                if (!success) {
                    this.hideProcessingStatus();
                    return;
                }
            }

            console.log('背景除去処理を開始...');
            this.showProcessingStatus();

            console.log('MediaPipeに画像を送信...');
            // 公式ドキュメントに従い、元画像を直接送信
            await this.selfieSegmentation.send({ image: this.originalImage });

        } catch (error) {
            console.error('背景除去エラー:', error);
            alert('背景除去に失敗しました: ' + error.message);
            this.hideProcessingStatus();
        }
    }

    handleBackgroundModeChange() {
        const backgroundMode = document.getElementById('backgroundMode');
        const backgroundColorGroup = document.getElementById('backgroundColorGroup');
        const blurIntensityGroup = document.getElementById('blurIntensityGroup');

        // 背景設定UIの表示切り替え
        if (backgroundMode.value === 'color') {
            backgroundColorGroup.style.display = 'block';
            blurIntensityGroup.style.display = 'none';
        } else if (backgroundMode.value === 'blur') {
            backgroundColorGroup.style.display = 'none';
            blurIntensityGroup.style.display = 'block';
        } else {
            backgroundColorGroup.style.display = 'none';
            blurIntensityGroup.style.display = 'none';
        }

        // プレビューを更新
        if (this.segmentationResults) {
            this.updateBackgroundPreview();
        }
    }

    updateBackgroundPreview() {
        console.log('updateBackgroundPreview呼び出し');
        console.log('segmentationResults:', this.segmentationResults);
        console.log('originalImage:', this.originalImage);
        
        if (!this.segmentationResults || !this.originalImage) {
            console.log('セグメンテーション結果または元画像がありません');
            return;
        }

        const backgroundMode = document.getElementById('backgroundMode');
        const newBackgroundColor = document.getElementById('newBackgroundColor');
        const blurIntensity = document.getElementById('blurIntensity');

        console.log('背景設定:', {
            mode: backgroundMode.value,
            color: newBackgroundColor.value,
            blur: blurIntensity.value
        });

        // プレビューキャンバスを元のサイズに設定
        this.backgroundPreviewCanvas.width = this.originalImage.width;
        this.backgroundPreviewCanvas.height = this.originalImage.height;
        
        console.log('キャンバスサイズ設定:', this.backgroundPreviewCanvas.width, 'x', this.backgroundPreviewCanvas.height);

        // セグメンテーションマスクを取得
        const segmentationMask = this.segmentationResults.segmentationMask;
        console.log('セグメンテーションマスク:', segmentationMask);
        console.log('マスクのタイプ:', typeof segmentationMask);
        console.log('マスクのコンストラクタ:', segmentationMask?.constructor?.name);
        
        if (!segmentationMask) {
            console.error('セグメンテーションマスクが無効です - マスクが存在しません');
            alert('セグメンテーション処理でエラーが発生しました。');
            return;
        }
        
        // HTMLImageElement、HTMLCanvasElement、ImageData等の可能性を確認
        console.log('マスクのプロパティ:', Object.getOwnPropertyNames(segmentationMask));
        if (segmentationMask.width) {
            console.log('マスクサイズ:', segmentationMask.width, 'x', segmentationMask.height);
        }
        
        // 背景を描画
        console.log('背景描画開始...');
        this.drawBackground(backgroundMode.value, newBackgroundColor.value, parseInt(blurIntensity.value));
        
        // マスクを適用して前景を描画
        console.log('マスク適用開始...');
        this.applySegmentationMask(segmentationMask);

        // プレビュー情報を更新
        document.getElementById('backgroundPreviewInfo').innerHTML = `
            <strong>サイズ:</strong> ${this.originalImage.width} × ${this.originalImage.height} px<br>
            <strong>背景:</strong> ${this.getBackgroundModeText(backgroundMode.value)}<br>
            <strong>処理:</strong> 完了
        `;

        // ダウンロードボタンを表示
        document.getElementById('backgroundDownloadBtn').style.display = 'block';
        console.log('背景除去プレビュー更新完了');
    }

    drawBackground(mode, color, blurValue) {
        this.backgroundPreviewCtx.clearRect(0, 0, this.backgroundPreviewCanvas.width, this.backgroundPreviewCanvas.height);

        if (mode === 'transparent') {
            // 透明背景（何もしない）
            return;
        } else if (mode === 'color') {
            // 単色背景
            this.backgroundPreviewCtx.fillStyle = color;
            this.backgroundPreviewCtx.fillRect(0, 0, this.backgroundPreviewCanvas.width, this.backgroundPreviewCanvas.height);
        } else if (mode === 'blur') {
            // ぼかし背景
            this.backgroundPreviewCtx.filter = `blur(${blurValue}px)`;
            this.backgroundPreviewCtx.drawImage(
                this.originalImage,
                0, 0,
                this.backgroundPreviewCanvas.width,
                this.backgroundPreviewCanvas.height
            );
            this.backgroundPreviewCtx.filter = 'none';
        }
    }

    applySegmentationMask(segmentationMask) {
        console.log('セグメンテーションマスクを適用中...', segmentationMask);
        
        const width = this.backgroundPreviewCanvas.width;
        const height = this.backgroundPreviewCanvas.height;
        
        try {
            // 一時キャンバスでマスクを処理
            const maskCanvas = document.createElement('canvas');
            maskCanvas.width = width;
            maskCanvas.height = height;
            const maskCtx = maskCanvas.getContext('2d');
            
            // セグメンテーションマスクを描画
            // マスクがHTMLImageElement、HTMLCanvasElement、ImageDataなどの場合に対応
            console.log('マスクを描画中...');
            maskCtx.drawImage(segmentationMask, 0, 0, width, height);
            
            // 前景画像（元画像）を描画
            const foregroundCanvas = document.createElement('canvas');
            foregroundCanvas.width = width;
            foregroundCanvas.height = height;
            const foregroundCtx = foregroundCanvas.getContext('2d');
            foregroundCtx.drawImage(this.originalImage, 0, 0, width, height);
            
            // マスクを適用して前景のみを残す
            console.log('マスクを適用中...');
            foregroundCtx.globalCompositeOperation = 'destination-in';
            foregroundCtx.drawImage(maskCanvas, 0, 0);
            
            // 背景の描画設定をリセット
            this.backgroundPreviewCtx.globalCompositeOperation = 'source-over';
            
            // 前景を描画
            console.log('前景を合成中...');
            this.backgroundPreviewCtx.drawImage(foregroundCanvas, 0, 0);
            
            console.log('セグメンテーション適用完了');
            
        } catch (error) {
            console.error('マスク適用エラー:', error);
            console.error('マスクの詳細:', {
                type: typeof segmentationMask,
                constructor: segmentationMask?.constructor?.name,
                width: segmentationMask?.width,
                height: segmentationMask?.height
            });
            
            // フォールバック：マスクなしで元画像をそのまま表示
            this.backgroundPreviewCtx.drawImage(this.originalImage, 0, 0, width, height);
            alert('背景除去の適用でエラーが発生しました。元画像を表示しています。');
        }
    }

    getBackgroundModeText(mode) {
        switch (mode) {
            case 'transparent': return '透明';
            case 'color': return '単色';
            case 'blur': return 'ぼかし';
            default: return mode;
        }
    }

    downloadBackgroundRemovedImage() {
        if (!this.segmentationResults) {
            alert('背景除去を実行してからダウンロードしてください。');
            return;
        }

        const backgroundMode = document.getElementById('backgroundMode');
        const dataURL = this.backgroundPreviewCanvas.toDataURL('image/png');
        
        const link = document.createElement('a');
        link.download = `background_removed_${this.originalImage.width}x${this.originalImage.height}.png`;
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
