#!/usr/bin/sh

cat replacelist.txt | while read line; do
neww=${line##* };
oldw=${line%% *};
echo "== Replacing ${oldw} -> ${neww}"

perl -e "s/${oldw}/${neww}/g" -pi  `grep -ril "${oldw}" locales/*` 
#grep -ril "${oldw}" common/* views/* 

done

