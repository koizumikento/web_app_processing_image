# 🖼️ ブラウザ動作する画像処理ツール

ブラウザ上で画像のリサイズ・形式変換・AI背景除去が可能なWebアプリケーションです。すべての処理はクライアントサイドで実行されるため、プライバシーが保護されます。

## ✨ 機能

### 📐 リサイズ機能
- **ドラッグ&ドロップ対応**: 画像を簡単にアップロード
- **リアルタイムプレビュー**: リサイズ結果をすぐに確認
- **縦横比維持**: 画像の比率を保ったままリサイズ
- **品質調整**: JPEG品質を自由に調整

### 🔄 形式変換機能
- **多形式対応**: JPEG、PNG、WebP形式への変換
- **背景色設定**: PNG→JPEG変換時の背景色を指定可能
- **品質最適化**: 形式に応じた最適な品質設定

### ✂️ 背景除去機能
- **AIベース背景除去**: MediaPipe Selfie Segmentationを使用
- **背景カスタマイズ**: 透明、単色、ぼかしから選択
- **リアルタイムプレビュー**: 処理結果を即座に確認
- **人物特化**: 人物の背景除去に最適化

### 🎨 ユーザーエクスペリエンス
- **タブ切り替え**: リサイズと形式変換機能を簡単に切り替え
- **状態記憶**: URLクエリパラメータでタブ状態を記憶
- **レスポンシブデザイン**: モバイルデバイスにも対応
- **PWA対応**: オフラインでも使用可能
- **プライバシー保護**: すべての処理がブラウザ内で完結

## 📁 プロジェクト構造

```
web_app_processing_image/
├── index.html              # メインHTMLファイル
├── script.js              # メインJavaScriptファイル（34KB）
├── styles.css             # CSSスタイルファイル（8.8KB）
├── manifest.json          # PWAマニフェスト
├── service-worker.js      # Service Workerファイル
├── package.json           # npmプロジェクト設定
├── package-lock.json      # npm依存関係ロック
├── .eslintrc.json         # ESLint設定
├── .gitignore            # Git除外ファイル設定
├── .github/
│   └── workflows/
│       └── deploy.yml     # GitHub Actions設定
└── README.md             # このファイル
```

## 🚀 使い方

1. **画像のアップロード**
   - ドラッグ&ドロップまたはクリックして画像を選択
   - JPEG、PNG、WebP形式に対応

2. **機能の選択**
   - **リサイズタブ**: 画像のサイズを変更
   - **形式変換タブ**: 画像形式を変換
   - **背景除去タブ**: AI技術で背景を除去

### 📐 リサイズ機能の使い方
1. 幅と高さを数値で指定
2. 縦横比の維持を選択可能
3. 品質スライダーで出力品質を調整
4. プレビューを確認後、ダウンロード

### 🔄 形式変換機能の使い方
1. 出力形式を選択（JPEG、PNG、WebP）
2. 品質設定（JPEGとWebPのみ）
3. 背景色設定（PNG→JPEG変換時）
4. プレビューを確認後、ダウンロード

### ✂️ 背景除去機能の使い方
1. 「背景除去を実行」ボタンをクリック
2. AI処理完了まで待機（数秒程度）
3. 背景設定を選択：
   - **透明**: 背景を完全に透明化
   - **単色**: 指定した色で背景を置換
   - **ぼかし**: 元画像をぼかして背景に使用
4. プレビューを確認後、PNG形式でダウンロード

### 🔗 状態記憶機能
- URL末尾に `?tab=resize`、`?tab=convert`、または `?tab=background` を追加
- ページ更新やリンク共有時もタブ状態を維持

## 🛠️ 開発環境のセットアップ

### 必要な環境
- Node.js 18以上
- npm

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd web_app_processing_image

# 依存関係をインストール
npm install
```

### 開発サーバーの起動

```bash
# 開発サーバーを起動 (http://localhost:3000)
npm run dev
```

### ビルド

```bash
# プロダクション用にビルド
npm run build
```

### リンティング

```bash
# コードの品質チェック
npm run lint

# 自動修正
npm run lint:fix
```

## 🔧 CI/CD

このプロジェクトはGitHub Actionsを使用してCI/CDパイプラインを設定しています。

### ワークフロー

1. **コード品質チェック**
   - ESLintによるJavaScriptのリンティング
   - テストの実行

2. **自動デプロイ**
   - mainブランチへのプッシュで自動的にGitHub Pagesにデプロイ
   - ビルド成果物の生成と配信

### GitHub Pagesの設定

このプロジェクトはGitHub Actionsを使用した自動デプロイが必要です。以下の手順で設定してください：

1. **GitHubリポジトリの設定**
   - GitHubリポジトリの「Settings」タブを開く
   - 左サイドバーから「Pages」を選択

2. **デプロイソースの変更**
   - 「Source」セクションで **「GitHub Actions」** を選択
   - ⚠️ **重要**: デフォルトの「Deploy from a branch」から必ず変更してください

3. **設定確認**
   - 設定が正しく保存されることを確認
   - `.github/workflows/deploy.yml`ファイルが存在することを確認

4. **初回デプロイ**
   - mainブランチにプッシュすると自動デプロイが開始されます
   - 「Actions」タブでデプロイ状況を監視できます

> **注意**: GitHub Actionsに設定変更しないと、自動デプロイが機能しません。従来の「Deploy from a branch」設定では、このプロジェクトのワークフローは動作しません。

## 📱 PWA対応

このアプリはProgressive Web App (PWA)として動作します：

- **オフライン対応**: Service Workerによるキャッシュ機能
- **インストール可能**: ホーム画面への追加が可能
- **ネイティブアプリ風のUX**: フルスクリーン表示

## 📦 主要な技術・ライブラリ

- **フロントエンド**: HTML5, CSS3, Vanilla JavaScript
- **AI背景除去**: MediaPipe Selfie Segmentation
- **PWA**: Service Worker, Web App Manifest
- **開発ツール**: ESLint, live-server
