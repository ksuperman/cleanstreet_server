echo "============================"
echo "Begin Export"

export PATH=/opt/mongodb/bin/:/usr/local/cuda-8.0/bin:/usr/local/cuda/bin:/home/student2/.nvm/versions/node/v6.10.0/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/usr/lib/jvm/java-8-oracle/bin:/usr/lib/jvm/java-8-oracle/db/bin:/usr/lib/jvm/java-8-oracle/jre/bin:/usr/local/cuda-8.0/bin

rm -r temp
mkdir temp

mongoexport --host $1 --db clean_street --collection images --sort '{"date_captured": -1}' --jsonArray --query '{"status": "N", "image_type":"training"}' --fields coco_url,date_captured,file_name,flickr_url,height,width,id,license | sed '/"_id":/s/"_id":[^,]*,//g' >> ./temp/images.json
mongoexport --host $1 --db clean_street --collection images --sort '{"date_captured": -1}' --jsonArray --query '{"status": "N", "image_type":"validate"}' --fields coco_url,date_captured,file_name,flickr_url,height,width,id,license | sed '/"_id":/s/"_id":[^,]*,//g' >> ./temp/validationImages.json

mongoexport --host $1 --db clean_street --collection imageannotations --jsonArray --query '{"image_type":"training"}' | sed '/"_id":/s/"_id":[^,]*,//g' >> ./temp/annotations.json
mongoexport --host $1 --db clean_street --collection imageannotations --jsonArray --query '{"image_type":"validate"}' | sed '/"_id":/s/"_id":[^,]*,//g' >> ./temp/validateAnnotations.json

echo "Export Complete"
echo "============================"