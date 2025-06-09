# 🖼️ 画像リサイズツール

ブラウザ上で簡単に画像をリサイズできるWebアプリケーションです。すべての処理はクライアントサイドで実行されるため、プライバシーが保護されます。

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

### 🎨 ユーザーエクスペリエンス
- **タブ切り替え**: リサイズと形式変換機能を簡単に切り替え
- **状態記憶**: URLクエリパラメータでタブ状態を記憶
- **レスポンシブデザイン**: モバイルデバイスにも対応
- **PWA対応**: オフラインでも使用可能
- **プライバシー保護**: すべての処理がブラウザ内で完結

## 🚀 使い方

1. **画像のアップロード**
   - ドラッグ&ドロップまたはクリックして画像を選択
   - JPEG、PNG、WebP形式に対応

2. **機能の選択**
   - **リサイズタブ**: 画像のサイズを変更
   - **形式変換タブ**: 画像形式を変換

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

### 🔗 状態記憶機能
- URL末尾に `?tab=resize` または `?tab=convert` を追加
- ページ更新やリンク共有時もタブ状態を維持

## 🛠️ 開発環境のセットアップ

### 必要な環境
- Node.js 18以上
- npm

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/yourusername/image-resizer-web-app.git
cd image-resizer-web-app

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

### HTMLバリデーション

```bash
# HTMLの妥当性をチェック
npm run validate-html
```

## 🔧 CI/CD

このプロジェクトはGitHub Actionsを使用してCI/CDパイプラインを設定しています。

### ワークフロー

1. **コード品質チェック**
   - ESLintによるJavaScriptのリンティング
   - HTML5バリデーション
   - テストの実行

2. **自動デプロイ**
   - mainブランチへのプッシュで自動的にGitHub Pagesにデプロイ
   - ビルド成果物の生成と配信

### GitHub Pagesの設定

1. GitHubリポジトリの「Settings」→「Pages」
2. Source: "GitHub Actions"を選択
3. mainブランチにプッシュすると自動デプロイが開始されます

## 📱 PWA対応

このアプリはProgressive Web App (PWA)として動作します：

- **オフライン対応**: Service Workerによるキャッシュ機能
- **インストール可能**: ホーム画面への追加が可能
- **ネイティブアプリ風のUX**: フルスクリーン表示

## 🌐 対応ブラウザ

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📄 ライセンス

MIT License - 詳細は[LICENSE](LICENSE)ファイルを参照してください。

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します！

1. フォークする
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

## 📞 サポート

質問や問題がありましたら、[Issues](https://github.com/yourusername/image-resizer-web-app/issues)までお気軽にお寄せください。 
