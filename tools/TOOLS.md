# 変換作業

## 大規模モジュールの分割
```
npx tsc ./tools/split-largemodule.ts && node ./tools/split-largemodule.js ./src/morphic.js
```

## モダン化
```
lebab --replace "./sandbox/_splitresult/morphic/" --transform class,arrow,arrow-return,for-of,for-each,arg-rest,arg-spread,obj-method,multi-var
```

## d.ts 生成
```
npx typescript sandbox/_splitresult/**/*.js --declaration --allowJs --emitDeclarationOnly --outDir types_
```
