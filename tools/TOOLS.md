# 変換作業

## 大規模モジュールの分割
```
npx tsc ./tools/split_largemodule.ts \
&& node ./tools/split_largemodule.js ./src/morphic.js
```

残念ながら、typescriptを直接実行する ts-node ではエラーとなる

```
ts-node ./tools/split_largemodule.ts ./src/morphic.js
```
```
import * as fs from 'fs';
       ^

SyntaxError: Unexpected token *
```

## モダン化の前処理

### TODO: スクリプトを作成すること
functionによるコンストラクタの前にある宣言が lebab でエラーを起こすのでfunction後に移動させる。

1. コンストラクタのfunction を見つける。
2. そのクラス名を示すvarがあれば、コメントで殺しておく
3. 前方参照と思われる var については global コメントに置き換えておく
4. function 前の実行文を、後方に付け加える

## モダン化
```
lebab \
  --replace "./sandbox/_splitresult/morphic/" \
  --transform class,arrow,arrow-return,for-of,for-each,\
arg-rest,arg-spread,obj-method,multi-var
```

## d.ts 生成
```
npx typescript sandbox/_splitresult/**/*.js \
--declaration --allowJs --emitDeclarationOnly \
--outDir ./sandbox/types
```
