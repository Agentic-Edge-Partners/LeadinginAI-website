import Foundation
import Vision
import CoreImage

// usage: cutout <in.png> <out.png>  — removes the background around the foreground subject.
let args = CommandLine.arguments
guard args.count >= 3 else { FileHandle.standardError.write("usage: cutout in out\n".data(using: .utf8)!); exit(1) }
guard let image = CIImage(contentsOf: URL(fileURLWithPath: args[1])) else { FileHandle.standardError.write("cannot read input\n".data(using: .utf8)!); exit(2) }
let handler = VNImageRequestHandler(ciImage: image, options: [:])
let request = VNGenerateForegroundInstanceMaskRequest()
do { try handler.perform([request]) } catch { FileHandle.standardError.write("vision failed: \(error)\n".data(using: .utf8)!); exit(3) }
guard let result = request.results?.first else { FileHandle.standardError.write("no foreground found\n".data(using: .utf8)!); exit(4) }
let maskBuffer = try result.generateScaledMaskForImage(forInstances: result.allInstances, from: handler)
let mask = CIImage(cvPixelBuffer: maskBuffer)
let blend = CIFilter(name: "CIBlendWithMask")!
blend.setValue(image, forKey: kCIInputImageKey)
blend.setValue(CIImage(color: .clear).cropped(to: image.extent), forKey: kCIInputBackgroundImageKey)
blend.setValue(mask, forKey: kCIInputMaskImageKey)
let out = blend.outputImage!.cropped(to: image.extent)
let ctx = CIContext()
guard let png = ctx.pngRepresentation(of: out, format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!) else { exit(5) }
try png.write(to: URL(fileURLWithPath: args[2]))
print("ok \(Int(image.extent.width))x\(Int(image.extent.height))")
