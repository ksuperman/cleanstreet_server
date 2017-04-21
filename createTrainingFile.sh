echo "Begin Export"
export PATH=/opt/mongodb/bin/:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/mysql/bin:/Library/TeX/texbin
rm images.json annotations.json finalTrainingJSON.json
mongoexport --db clean_street --collection images --jsonArray --query '{"status": "N"}' --fields coco_url,date_captured,file_name,flickr_url,height,width,id,license | sed '/"_id":/s/"_id":[^,]*,//g' >> images.json
mongoexport --db clean_street --collection imageannotations --jsonArray --query '{}' | sed '/"_id":/s/"_id":[^,]*,//g' >> annotations.json
echo "Export Complete"