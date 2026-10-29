import sys,glob,os
from PIL import Image
d=sys.argv[1]; pat=sys.argv[2] if len(sys.argv)>2 else '*'; out=sys.argv[3]; per=int(sys.argv[4]) if len(sys.argv)>4 else 6
fs=sorted(glob.glob(os.path.join(d,pat+'.png')))
fs=[f for f in fs if 'poster_full' not in f]
ims=[Image.open(f).convert('RGB') for f in fs]
if not ims: sys.exit('none')
w,h=ims[0].size; sc=.5
tw,th=int(w*sc),int(h*sc)
rows=(len(ims)+per-1)//per
c=Image.new('RGB',(per*(tw+6),rows*(th+6)),'white')
for i,im in enumerate(ims):
    c.paste(im.resize((tw,th)),((i%per)*(tw+6),(i//per)*(th+6)))
c.save(out); print(len(ims),'->',out)
