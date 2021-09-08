# 変換作業

## 大規模モジュールの分割
```bash
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

functionによるコンストラクタの前にある宣言が lebab でエラーを起こすのでfunction後に移動させる。

1. コンストラクタのfunction を見つける。
2. そのクラス名を示すvarがあれば、コメントで殺しておく
3. 前方参照と思われる var については global コメントに置き換えておく
4. function 前の実行文を、後方に付け加える

```bash
tsc ./tools/pre_lebab.ts
find ./sandbox/_splitresult/morphic -name "*.js" -exec node ./tools/pre_lebab.js \{\} \;
```

結果は入力ファイル foo.js に.converted を付加した foo.converted.js になります。


## モダン化

ES2015 class 化を行い、記法の近代化を行います。

前処理で出力した *.converted.js ファイルを対象にして lebab を実行します。


```bash
lebab \
  --replace "./sandbox/_splitresult/morphic/*.converted.js" \
  --transform class,arrow,arrow-return,for-of,for-each,\
arg-rest,arg-spread,obj-method,multi-var
```


## モダン化の後処理

### 問題
ここまででクラス化は行われますが、2点問題が残ります。

1. 継承しているクラスの場合、継承元の super() コールが欠けているのでエラーとなってしまいます。

1. コンストラクタ内で呼ばれている this.init(...)が virtual メソッド的な呼ばれ方をして意図した動作が得られません。

### 対策
1. 継承しているクラスのコンストラクタの先頭にsuper コールを挿入

2. 多態メソッド呼び出しとならないように、```<自身のクラス名>.prototype.init.call(this, ...)``` 形式に置き換えます。



```bash
find ./sandbox/_splitresult/morphic -name "*converted.js" \
-exec node ./tools/post_lebab.js \{\} \;
```

### 後処理のまとめ

本来であれば、this.initメソッドは、コンストラクタ内で すべてインライン化すべきであるが、膨大な数のクラスが、.initコールに依存しているため、これは行わない。

全ての .uber.* コールも super コールに置き換えたいが、移行の段階では障害のほうが多いため、これも行っていない。

クラス化と typescript 化が進んで目処がついたら、これを行う。


## d.ts 生成
```bash
npx typescript sandbox/_splitresult/**/*.js \
--declaration --allowJs --emitDeclarationOnly \
--outDir ./sandbox/types
```
