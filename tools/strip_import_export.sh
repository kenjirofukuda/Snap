#!/usr/bin/env bash

file=$1
temp=$(mktemp)
sed -e '/^import /d' -e 's/^export //g' "${file}" > "${temp}"
cp "${temp}" "${file}"
