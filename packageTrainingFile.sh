echo "============================"
echo "Begin File Package"

export PATH=/opt/mongodb/bin/:/usr/local/cuda-8.0/bin:/usr/local/cuda/bin:/home/student2/.nvm/versions/node/v6.10.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/usr/lib/jvm/java-8-oracle/bin:/usr/lib/jvm/java-8-oracle/db/bin:/usr/lib/jvm/java-8-oracle/jre/bin:/usr/local/cuda-8.0/bin

rm -r data

mkdir data
mkdir data/annotations
mkdir data/train2014
mkdir data/val2014


cp -a ./temp/instances_val2014.json ./data/annotations/instances_val2014.json
cp -a ./temp/instances_train2014.json ./data/annotations/instances_train2014.json

cp -a ./images/img/training/. ./data/train2014/
cp -a ./images/img/validation/. ./data/val2014/

# rm data.tar.xz

if [ "$1" == "sendToServer" ]; then echo $1; fi

tar cJf data.tar.xz ./data

rm -r ./data

rm -r ./temp

echo "File Package Complete"
echo "============================"