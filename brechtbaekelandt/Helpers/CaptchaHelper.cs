using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Drawing.Text;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Formatters.Binary;
using System.Threading.Tasks;
using brechtbaekelandt.Models;

namespace brechtbaekelandt.Helpers
{
    public class CaptchaHelper
    {
        public Captcha CreateNewCaptcha(int length)
        {
            var captchaValue = new CaptchaValue()
            {
                Value = this.GenerateRandomString(length),
                LastTimeAttempted = DateTime.Now,
                FirstTimeAttempted = DateTime.Now,
                NumberOfTimesAttempted = 0
            };

            var captcha = new Captcha()
            {

                ValueString = this.SerializeCaptchaValue(captchaValue)
            };

            return captcha;
        }

        public string CreateCaptchaImage(Captcha captcha, int width = 190, int height = 80)
        {
            var captchaValue = this.DeserializeCaptchaValue(captcha.ValueString);

            var fontEmSizes = new int[] { 15, 20, 25, 30, 35 };

            var fontNames = new string[]
            {
                "Trebuchet MS",
                "Arial",
                "Times New Roman",
                "Georgia",
                "Verdana",
                "Geneva"
            };

            FontStyle[] fontStyles =
            {
                FontStyle.Bold,
                FontStyle.Italic,
                FontStyle.Regular,
                FontStyle.Strikeout,
                FontStyle.Underline
            };

            HatchStyle[] hatchStyles =
            {
                HatchStyle.BackwardDiagonal, HatchStyle.Cross,
                HatchStyle.DashedDownwardDiagonal, HatchStyle.DashedHorizontal,
                HatchStyle.DashedUpwardDiagonal, HatchStyle.DashedVertical,
                HatchStyle.DiagonalBrick, HatchStyle.DiagonalCross,
                HatchStyle.Divot, HatchStyle.DottedDiamond, HatchStyle.DottedGrid,
                HatchStyle.ForwardDiagonal, HatchStyle.Horizontal,
                HatchStyle.HorizontalBrick, HatchStyle.LargeCheckerBoard,
                HatchStyle.LargeConfetti, HatchStyle.LargeGrid,
                HatchStyle.LightDownwardDiagonal, HatchStyle.LightHorizontal,
                HatchStyle.LightUpwardDiagonal, HatchStyle.LightVertical,
                HatchStyle.Max, HatchStyle.Min, HatchStyle.NarrowHorizontal,
                HatchStyle.NarrowVertical, HatchStyle.OutlinedDiamond,
                HatchStyle.Plaid, HatchStyle.Shingle, HatchStyle.SmallCheckerBoard,
                HatchStyle.SmallConfetti, HatchStyle.SmallGrid,
                HatchStyle.SolidDiamond, HatchStyle.Sphere, HatchStyle.Trellis,
                HatchStyle.Vertical, HatchStyle.Wave, HatchStyle.Weave,
                HatchStyle.WideDownwardDiagonal, HatchStyle.WideUpwardDiagonal, HatchStyle.ZigZag
            };

            var bitmap = new Bitmap(width, height, PixelFormat.Format24bppRgb);

            var graphics = Graphics.FromImage(bitmap);
            graphics.TextRenderingHint = TextRenderingHint.AntiAlias;

            var rectangleF = new RectangleF(0, 0, width, height);

            var random = new Random();

            //Draw background (Lighter colors RGB 100 to 255)
            var brush = new HatchBrush(hatchStyles[random.Next
                (hatchStyles.Length - 1)], Color.FromArgb((random.Next(100, 255)),
                (random.Next(100, 255)), (random.Next(100, 255))), Color.White);
            graphics.FillRectangle(brush, rectangleF);

            // There is no spoon
            var theMatrix = new Matrix();

            for (var i = 0; i <= captchaValue.Value.Length - 1; i++)
            {
                theMatrix.Reset();

                var charLength = captchaValue.Value.Length;
                var x = width / (charLength + 1) * i;
                var y = height / 2;

                //Rotate text Random
                theMatrix.RotateAt(random.Next(-40, 40), new PointF(x, y));

                graphics.Transform = theMatrix;

                //Draw the letters with Random Font Type, Size and Color
                graphics.DrawString
                (
                    //Text
                    captchaValue.Value.Substring(i, 1),

                    //Random Font Name and Style
                    new Font(fontNames[random.Next(fontNames.Length - 1)],
                        fontEmSizes[random.Next(fontEmSizes.Length - 1)],
                        fontStyles[random.Next(fontStyles.Length - 1)]),

                    //Random Color (Darker colors RGB 0 to 100)
                    new SolidBrush(Color.FromArgb(random.Next(0, 100),
                        random.Next(0, 100), random.Next(0, 100))),
                    x,

                    random.Next(10, 40)
                );

                graphics.ResetTransform();
            }

            var buffer = new byte[16 * 1024];

            using (var ms = new MemoryStream())
            {
                bitmap.Save(ms, ImageFormat.Png);

                int read;

                while ((read = ms.Read(buffer, 0, buffer.Length)) > 0)
                {
                    ms.Write(buffer, 0, read);
                }

                var base64String = Convert.ToBase64String(ms.ToArray());

                return $"data:image/png;base64,{base64String}";
            }
        }

        public Captcha ValidateCaptcha(Captcha captcha, string attemptedCaptchaValue)
        {
            var captchaValue = this.DeserializeCaptchaValue(captcha.ValueString);

            if (captchaValue.NumberOfTimesAttempted >= 5)
            {
                captcha.AttemptFailed = true;
                captcha.AttemptFailedMessage = "the captcha was wrong for too many times, refresh the captcha!";
            }
            else if (attemptedCaptchaValue != captchaValue.Value)
            {
                captcha.AttemptFailed = true;
                captcha.AttemptFailedMessage = "the captcha was not correct, try again...";
            }
            else
            {
                captcha.AttemptFailed = false;
                captcha.AttemptSucceeded = true;
            }

            captchaValue.LastTimeAttempted = DateTime.Now;
            captchaValue.NumberOfTimesAttempted += 1;

            captcha.ValueString = this.SerializeCaptchaValue(captchaValue);

            return captcha;
        }

        private string SerializeCaptchaValue(CaptchaValue value)
        {
            using (var ms = new MemoryStream())
            {
                new BinaryFormatter().Serialize(ms, value);
                return Convert.ToBase64String(ms.ToArray());
            }
        }

        private CaptchaValue DeserializeCaptchaValue(string base64String)
        {
            var bytes = Convert.FromBase64String(base64String);

            using (var ms = new MemoryStream(bytes, 0, bytes.Length))
            {
                ms.Write(bytes, 0, bytes.Length);
                ms.Position = 0;

                return new BinaryFormatter().Deserialize(ms) as CaptchaValue;
            }
        }

        private string GenerateRandomString(int length)
        {
            var random = new Random();

            const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

            return new string(Enumerable.Repeat(chars, length).Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}


