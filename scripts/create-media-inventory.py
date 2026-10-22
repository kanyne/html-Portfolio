"""Verified filenames from the two pages of Alkan's public WordPress media API."""
import json
from pathlib import Path
base='https://alkanbiz.com/wp-content/uploads/'
files=[]
def add(folder,names):
 for n in names:files.append(base+folder+'/'+n)
add('2026/07',['seedream-5.0-pro_a_resize_this_poster_f-scaled.jpeg','books-scaled.jpeg','video-new-scaled.jpeg','pexels-kampus-8204383-scaled.jpg','pexels-jep-gambardella-7689740-1-scaled.jpg','pexels-jep-gambardella-7689740-scaled.jpg','pexels-pavel-danilyuk-8761682-1.jpg','pexels-gabby-k-9487621-1-scaled.jpg','pexels-pavel-danilyuk-8761682.jpg','pexels-gabby-k-9479830-1-scaled.jpg','pexels-gabby-k-9487621-scaled.jpg','pexels-gabby-k-9489084-1-scaled.jpg','pexels-gabby-k-9479830-scaled.jpg','pexels-gabby-k-9487229-1-scaled.jpg','pexels-gabby-k-9489084-scaled.jpg','pexels-edmond-dantes-8553864-1-scaled.jpg','pexels-gabby-k-9487229-scaled.jpg','pexels-edmond-dantes-8553864-scaled.jpg','Alkan-promo-final.mp4','Alkan-Video-scaled.jpeg'])
add('2026/01',['WhatsApp-Image-2025-12-23-at-17.11.57-1.jpeg'])
add('2023/03',['profin-logo_ntused_.jpg','gcb_logo.png','ecobank.png'])
add('2022/03',['WhatsApp-Image-2022-03-12-at-9.34.23-AM.jpeg','WhatsApp-Image-2022-03-12-at-9.34.22-AM.jpeg','alberta-quarcoopome.webp'])
add('2021/12',['WhatsApp-Image-2021-12-23-at-22.51.59.jpeg'])
add('2021/11',['1400x800-d.jpg','1400x800-c.jpg','1400x800.jpg','1400x800-b.jpg','mid2-1.png','unicredit_new-1.png','omni-1.png','souv.jpg'])
videos=['18.58.13-6','18.58.14-5','18.58.14-1-4']
add('2021/11',['WhatsApp-Video-2021-11-15-at-'+v+'.mp4' for v in videos])
add('2021/11',['slider04-2.png','slider03-1.png','slider05-1.png','logo-2.png','cropped-akanbiz.png','akanbiz.png','13737442_1241935425839898_4910017398401613576_o.jpg','Alberta-Quarcoopome.jpg','new_book.png'])
files.append(base+'woocommerce-placeholder.png')
videos=['18.58.13-1-3','18.58.13-2-3','18.58.14-4','18.58.14-1-3','18.58.13-4','18.58.13-1-2','18.58.13-2-2','18.58.14-3','18.58.14-1-2','18.58.13-3','18.58.13-1-1','18.58.13-2-1','18.58.14-2','18.58.14-1-1','18.58.13','18.58.13-1','18.58.13-2','18.58.14','18.58.14-1']
add('2021/11',['WhatsApp-Video-2021-11-15-at-'+v+'.mp4' for v in videos])
photos=['18.58.04','18.58.06','18.58.08','18.58.09','18.58.11','19.48.16','19.46.01','19.46.01-1','19.46.00','19.57.55','19.57.54','19.57.54-1','19.57.53','19.57.53-2','19.57.53-1','19.57.52','19.57.52-2','19.57.52-1','19.57.51','19.57.51-2','19.57.51-1','19.57.50','19.57.50-2','19.57.50-1','19.57.49','19.57.49-2','19.57.49-1','19.57.48','19.57.48-2','19.57.48-1','19.57.47','19.57.47-2','19.57.47-1','19.57.46','19.57.46-2','19.57.46-1','19.57.45','19.57.45-2','19.57.45-1','19.57.44','19.57.44-1','19.57.43','19.57.43-2','19.57.43-1','19.57.42','19.57.42-2','19.57.42-1','19.57.41','19.57.41-2','19.57.41-1','19.57.40','19.57.40-2','19.57.40-1','19.57.39','19.57.38','19.57.38-2','19.57.38-1','19.57.37','19.57.37-1','19.57.36','19.57.36-1','19.57.35','19.57.35-1','19.57.34','19.57.34-1']
add('2021/11',['WhatsApp-Image-2021-11-15-at-'+v+'.jpeg' for v in photos])
add('2021/11',['Annotation-2021-11-09-220933-v4.jpg','Annotation-2021-11-09-220933-v3.jpg','Annotation-2021-11-09-220933-v2.jpg','slider02-1.png','Annotation-2021-11-09-221001-v2.jpg','Annotation-2021-11-09-220933.jpg','Annotation-2021-11-09-220933-v5-1.jpg','slider04-1.png','Annotation-2021-11-09-221001-v8-4.jpg','Annotation-2021-11-09-221001-v7-1.jpg','Annotation-2021-11-09-221001-2.jpg','Annotation-2021-11-09-221001-v8-3.jpg','Annotation-2021-11-09-221001-v8-2.jpg','Annotation-2021-11-09-221001-1-1.jpg','Annotation-2021-11-09-221001-v8-1.jpg','Annotation-2021-11-09-221001-1.jpg','Annotation-2021-11-09-221001-v8.jpg','Annotation-2021-11-09-221001-v9-1.jpg'])
add('2021/11',['IMG_'+v+'_1-scaled.jpg' for v in ['5978','5973','5907','5901','5856','5846','5823']])
add('2021/11',['cropped-logo-1.png','logo-1.png','slider05.png','slider04.png','slider01.png','Annotation-2021-11-09-221001-v7.jpg','slider03.png','slider02.png','Annotation-2021-11-09-220933-v5.jpg','slider-side-1.png','REOBB.jpg','omni.png','mid2.png','royal-bankpn.png','unicredit_new.png','cropped-logo_new.jpg','logo_new.jpg','logo.png'])
assert len(files)==len(set(files))
items=[]
for i,url in enumerate(files):
 name=url.rsplit('/',1)[-1]
 kind='video' if name.endswith('.mp4') else 'image'
 category='Videos' if kind=='video' else 'Stock imagery' if name.startswith('pexels-') else 'Photos' if name.startswith(('WhatsApp-Image','IMG_','alberta-','Alberta-','13737442')) else 'Website artwork'
 title='Get to know Alkan Business Consult' if name=='Alkan-promo-final.mp4' else 'Video from the Alkan archive' if kind=='video' else 'Photo from the Alkan website' if category=='Photos' else 'Stock image from the original website' if category=='Stock imagery' else 'Artwork from the Alkan website'
 items.append(dict(id=f'media-{i+1}',url=url,kind=kind,category=category,title=title,filename=name))
# Additional original images linked directly from the current About page, outside WordPress uploads.
for name,url in [('Company banner','https://alkanbiz.com/images/banners/web-banner.png'),('Founder portrait','https://alkanbiz.com/images/team/alberta_new.png')]:
 items.append(dict(id=f'media-{len(items)+1}',url=url,kind='image',category='Website artwork' if name=='Company banner' else 'Photos',title=name,filename=url.rsplit('/',1)[-1]))
Path('data/media.json').write_text(json.dumps(items,indent=2)+'\n')
print(len(files),'WordPress media files;',len(items),'including direct About page images;',sum(x['kind']=='video' for x in items),'videos')
