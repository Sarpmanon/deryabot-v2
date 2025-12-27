#!/usr/bin/python3

import PIL.Image
from PIL import Image, ImageChops
import sys, os, io, math
import asyncio
import aiohttp
import numpy as np

USER_AGENT = "pixelyafun areaDownload 1.0 " + ' '.join(sys.argv[1:])
PPFUN_URL = "https://pixelya.fun"

class Color(object):
    def __init__(self, index, rgb):
        self.rgb = rgb
        self.index = index

class EnumColorPixelplanet:

    ENUM = []

    def getColors(canvas):
        colors = canvas['colors']
        for i, color in enumerate(colors):
            EnumColorPixelplanet.ENUM.append(Color(i, tuple(color)))
    
    @staticmethod
    def index(i):
        for color in EnumColorPixelplanet.ENUM:
            if i == color.index:
                return color
        return EnumColorPixelplanet.ENUM[0]

class Matrix:
    def __init__(self):
        self.start_x = None
        self.start_y = None
        self.width = None
        self.height = None
        self.matrix = {}

    def add_coords(self, x, y, w, h):
        if self.start_x is None or self.start_x > x:
            self.start_x = x
        if self.start_y is None or self.start_y > y:
            self.start_y = y
        end_x_a = x + w
        end_y_a = y + h
        if self.width is None or self.height is None:
            self.width = w
            self.height = h
        else:
            end_x_b = self.start_x + self.width
            end_y_b = self.start_y + self.height
            self.width = max(end_x_b, end_x_a) - self.start_x
            self.height = max(end_y_b, end_y_a) - self.start_y

    def create_image(self):
        img = PIL.Image.new('RGBA', (self.width, self.height), (255, 0, 0, 0))
        pxls = img.load()
        for x in range(self.width):
            for y in range(self.height):
                try:
                    color = self.matrix[x + self.start_x][y + self.start_y].rgb
                    pxls[x, y] = color
                except (IndexError, KeyError, AttributeError):
                    pass
        return img

    def set_pixel(self, x, y, color):
        if x >= self.start_x and x < (self.start_x + self.width) and y >= self.start_y and y < (self.start_y + self.height):
            if x not in self.matrix:
                self.matrix[x] = {}
            self.matrix[x][y] = color

async def fetchMe():
    url = f"{PPFUN_URL}/api/me"
    headers = {
      'User-Agent': USER_AGENT
    }
    async with aiohttp.ClientSession() as session:
        attempts = 0
        while True:
            try:
                async with session.get(url, headers=headers) as resp:
                    data = await resp.json()
                    return data
            except:
                if attempts > 3:
                    print(f"Could not get {url} in three tries, cancelling")
                    raise
                attempts += 1
                print(f"Failed to load {url}, trying again in 5s")
                await asyncio.sleep(5)
                pass

async def fetch(session, canvas_id, canvasoffset, ix, iy, target_matrix):
    url = f"{PPFUN_URL}/chunks/{canvas_id}/{ix}/{iy}.bmp"
    headers = {
      'User-Agent': USER_AGENT
    }
    attempts = 0
    while True:
        try:
            async with session.get(url, headers=headers) as resp:
                data = await resp.read()
                offset = int(-canvasoffset * canvasoffset / 2)
                off_x = ix * 256 + offset
                off_y = iy * 256 + offset
                if len(data) == 0:
                    clr = EnumColorPixelplanet.index(0)
                    for i in range(256*256):
                        tx = off_x + i % 256 
                        ty = off_y + i // 256
                        target_matrix.set_pixel(tx, ty, clr)
                else:
                    i = 0
                    for b in data:
                        tx = off_x + i % 256
                        ty = off_y + i // 256
                        bcl = b & 0x7F
                        target_matrix.set_pixel(tx, ty, EnumColorPixelplanet.index(bcl))
                        i += 1
                #print(f"Loaded {url} with {i} pixels")
                break
        except:
            if attempts > 3:
                print(f"Could not get {url} in three tries, cancelling")
                raise
            attempts += 1
            print(f"Failed to load {url}, trying again in 3s")
            await asyncio.sleep(3)
            pass

async def get_area(canvas_id, canvas, x, y, w, h):
    target_matrix = Matrix()
    target_matrix.add_coords(x, y, w, h)
    canvasoffset = math.pow(canvas['size'], 0.5)
    offset = int(-canvasoffset * canvasoffset / 2)
    xc = (x - offset) // 256
    wc = (x + w - offset) // 256
    yc = (y - offset) // 256
    hc = (y + h - offset) // 256
    #print(f"Loading from {xc} / {yc} to {wc + 1} / {hc + 1} PixelGetter")
    tasks = []
    async with aiohttp.ClientSession() as session:
        for iy in range(yc, hc + 1):
            for ix in range(xc, wc + 1):
                tasks.append(fetch(session, canvas_id, canvasoffset, ix, iy, target_matrix))
        await asyncio.gather(*tasks)
        return target_matrix

def validateCoorRange(ulcoor: str, brcoor: str, canvasSize: int): # stolen from hf with love
    if not ulcoor or not brcoor:
        return "Not all coordinates defined"
    splitCoords = ulcoor.strip().split('_')
    if not len(splitCoords) == 2:
        return "Invalid Coordinate Format for top-left corner"
    
    x, y = map(lambda z: int(math.floor(float(z))), splitCoords)

    splitCoords = brcoor.strip().split('_')
    if not len(splitCoords) == 2:
        return "Invalid Coordinate Format for top-left corner"
    u, v = map(lambda z: int(math.floor(float(z))), splitCoords)
    
    error = None

    if (math.isnan(x)):
        error = "x of top-left corner is not a valid number"
    elif (math.isnan(y)):
        error = "y of top-left corner is not a valid number"
    elif (math.isnan(u)):
        error = "x of bottom-right corner is not a valid number"
    elif (math.isnan(v)):
        error = "y of bottom-right corner is not a valid number"
    elif (u < x or v < y):
        error = "Corner coordinates are aligned wrong"

    if not error is None:
        return error
    
    canvasMaxXY = canvasSize / 2
    canvasMinXY = -canvasMaxXY
    
    if (x < canvasMinXY or y < canvasMinXY or x >= canvasMaxXY or y >= canvasMaxXY):
        return "Coordinates of top-left corner are outside of canvas"
    if (u < canvasMinXY or v < canvasMinXY or u >= canvasMaxXY or v >= canvasMaxXY):
        return "Coordinates of bottom-right corner are outside of canvas"
    
    return (x, y, u, v)
def compare_images(image1, image2_path, x1, y1, x2, y2, userid):
    #print(f"Kaydedilecek dosya adı: {userid}")
    # Load the second image from the file path
    image2 = Image.open(image2_path)
    i2w, i2h = image2.size

    image1 = image1.convert("RGBA")
    image2 = image2.convert("RGBA")

    bbox  = image2.getbbox()
    zencigot1 = image1.crop(bbox)
    zencigot2 = image2.crop(bbox)

    #total_pixels = zencigot2.width * zencigot2.height

    zencipixels = zencigot2.getdata()

    diff_image = Image.new("RGBA", zencigot1.size, (255, 255, 255))
    wrong_pixels = []
    wrong_pixelcount = 0
    fatass = 0 #şeffaf piksel sayısı

    try:
        translucent = Image.new("RGBA", zencigot1.size, (255, 0, 0, 255))
        mask = ImageChops.difference(zencigot1, zencigot2).convert("L").point(lambda x: 255 if x > 0 else 0)
        #mask.save("mask.png")

        hopbidizencigot = zencigot2.convert("LA").convert("RGBA") #asıl shablon
        data = zencigot2.getdata()

        aligned_image2 = Image.new("RGBA", zencigot1.size, (0, 0, 0, 0))
        aligned_image2.paste(hopbidizencigot, (0, 0))
        #aligned_image2.save("alignedöncesi.png")

    except Exception as e:
        print("Hata:", e)

    newData = []
    for item in data:
        if item[3] == 0:
            newData.append((0, 0, 0, 0))
        else:
            newData.append((255, 0, 0, 255))
    translucent.putdata(newData)
    #translucent.save("translucent.png")

    result = ImageChops.composite(translucent, aligned_image2, mask)

    #
    resultpixels = result.getdata()
    result_target_color = (255, 0, 0, 255)
    total_pixels = sum(1 for pixel in resultpixels if pixel[3] != 0)

    wrong_pixelcount = sum(1 for pixel in resultpixels if pixel == result_target_color)
    #

    matching_pixels = total_pixels - wrong_pixelcount
    matching_percentage =  100 - (round((wrong_pixelcount / total_pixels) * 100, 4))
    wrong_pixels = wrong_pixelcount

    print(str(matching_percentage) + "-" + str(total_pixels) + "-" + str(wrong_pixelcount) + "-" + str(i2w) + "-" + str(i2h))

    #image2.paste(translucent, (0, 0), mask)
    result.save(f"data\\templates\\{sys.argv[6]}\\downloads\\getpercentage_{userid}.png")
    return matching_percentage, wrong_pixels, diff_image, wrong_pixels

async def main():
    apime = await fetchMe()

    canvas_id = sys.argv[1]

    if canvas_id not in apime['canvases']:
        print("Invalid canvas selected")
        return

    canvas = apime['canvases'][canvas_id]

    if 'v' in canvas and canvas['v']:
        print("Can\'t get area for 3D canvas")
        return

    filename = sys.argv[3]
    image_path2 = filename
    image2 = Image.open(image_path2).convert("RGBA")
    x1 = sys.argv[2].split('_')[0] #4075
    y1 = sys.argv[2].split('_')[1] #-9033
    x2 = int(x1) + image2.width - 1 #4296
    y2 = int(y1) + image2.height - 1 #2335
    parseCoords = validateCoorRange(sys.argv[2], str(x2) + "_" + str(y2), canvas['size'])

    if (type(parseCoords) is str):
        print(parseCoords)
        sys.exit()
    else:
        x, y, w, h = parseCoords
        w = w - x + 1
        h = h - y + 1

    EnumColorPixelplanet.getColors(canvas)

    matrix = await get_area(canvas_id, canvas, x, y, w, h)
    image1 = matrix.create_image()
    image1.save("test.png")
    #print("Done!")

    filename = sys.argv[3]
    image_path2 = filename
    image2 = Image.open(image_path2)
    x1 = sys.argv[2].split('_')[0]
    y1 = sys.argv[2].split('_')[1]
    x2 = int(x1) + image2.width
    y2 = int(y1) + image2.height
    userid = sys.argv[5]

    matching_percentage, wrong_pixels, diff_image, wrong_px = compare_images(image1, image_path2, x1, y1, x2, y2, userid)
    #print(f"Done-Matching Percentage: {round(matching_percentage,2)}%-Amount of wrong pixels: {wrong_px}")
    

if __name__ == "__main__":
    asyncio.run(main())