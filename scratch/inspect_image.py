import zlib
import struct

def reconstruct_png(width, height, bytes_per_pixel, idat_data):
    stride = width * bytes_per_pixel + 1
    recon = bytearray(height * width * bytes_per_pixel)
    for y in range(height):
        row_start = y * stride
        filter_type = idat_data[row_start]
        for x in range(width * bytes_per_pixel):
            recon_idx = y * width * bytes_per_pixel + x
            raw_val = idat_data[row_start + 1 + x]
            left = recon[recon_idx - bytes_per_pixel] if x >= bytes_per_pixel else 0
            up = recon[recon_idx - width * bytes_per_pixel] if y > 0 else 0
            up_left = recon[recon_idx - width * bytes_per_pixel - bytes_per_pixel] if (y > 0 and x >= bytes_per_pixel) else 0
            if filter_type == 0: val = raw_val
            elif filter_type == 1: val = (raw_val + left) & 0xff
            elif filter_type == 2: val = (raw_val + up) & 0xff
            elif filter_type == 3: val = (raw_val + (left + up) // 2) & 0xff
            elif filter_type == 4:
                p = left + up - up_left
                pa = abs(p - left)
                pb = abs(p - up)
                pc = abs(p - up_left)
                if pa <= pb and pa <= pc: pred = left
                elif pb <= pc: pred = up
                else: pred = up_left
                val = (raw_val + pred) & 0xff
            recon[recon_idx] = val
    return recon

def find_other_pixels(filepath):
    with open(filepath, 'rb') as f:
        f.read(8)
        chunks = []
        while True:
            length_bytes = f.read(4)
            if not length_bytes: break
            length = struct.unpack('>I', length_bytes)[0]
            chunk_type = f.read(4)
            chunk_data = f.read(length)
            f.read(4)
            if chunk_type == b'IHDR':
                width, height, depth, color_type, compression, filter_type, interlace = struct.unpack('>IIBBBBB', chunk_data)
            elif chunk_type == b'IDAT': chunks.append(chunk_data)
            elif chunk_type == b'IEND': break
        idat_data = zlib.decompress(b''.join(chunks))
        bytes_per_pixel = 4 if color_type == 6 else 3
        recon = reconstruct_png(width, height, bytes_per_pixel, idat_data)
        
        other_pixels = []
        for y in range(height):
            for x in range(width):
                idx = (y * width + x) * bytes_per_pixel
                r, g, b = recon[idx], recon[idx+1], recon[idx+2]
                # Light grey background check
                if r == 248 and g == 248 and b == 248: continue
                # Pure white check
                if r == 255 and g == 255 and b == 255: continue
                # Yellow check
                if r > 150 and g > 150 and b < 100: continue
                
                other_pixels.append(((x, y), (r, g, b)))
                
        print(f"Other pixels count: {len(other_pixels)}")
        if len(other_pixels) > 0:
            xs = [p[0][0] for p in other_pixels]
            ys = [p[0][1] for p in other_pixels]
            print(f"Bounding box: X ({min(xs)}, {max(xs)}), Y ({min(ys)}, {max(ys)})")
            # Print unique colors
            colors = set(p[1] for p in other_pixels)
            print("Unique colors:", colors)

dir_path = "C:/Users/USER/.gemini/antigravity-ide/brain/aed49e12-e73a-42c2-b9ea-106901575c04/"
find_other_pixels(dir_path + "media__1781172543563.png")
