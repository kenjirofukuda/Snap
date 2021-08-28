#!/usr/bin/env bash
find sandbox -name "*.js" -exec ./strip_import_export.sh \{\} \;
