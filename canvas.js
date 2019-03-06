function CreateCanvas(element, image) {
    this.element = element,
    this.image = image;
    setTimeout(() => {
        this.element.width = this.image.width;
        this.element.height = this.image.height;
        this.element.style.width = `${this.image.width}px`;
        this.element.style.height = `${this.image.height}px`;
        this.element.oncontextmenu = (e) => e.preventDefault();
        this.draw();
    }, 10);
    this.context = this.element.getContext('2d');
    this.drawing = false,
    this.formats = [],
    this.temp_formats = [];
    this.draw = () => {
        this.context.clearRect(0, 0, this.element.width, this.element.height);
        this.context.globalAlpha = 0.5;
        this.context.drawImage(this.image, 0, 0);
        this.context.globalAlpha = 1;
        this.context.lineWidth = 2;
        this.formats.forEach(form => {
            if (form.type === 'polygon') {
                this.context.beginPath();
                this.context.strokeStyle = '#000000';
                form.coords.forEach(point => {
                    this.context.lineTo(point.x, point.y);
                })
                this.context.stroke();
                this.context.closePath()
            } else if (form.type === 'arc') {
                this.context.beginPath();
                this.context.strokeStyle = '#000000';
                this.context.arc(form.x, form.y, form.r, 0, 2 * Math.PI);
                this.context.stroke();
                this.context.closePath()
            }
        });
        this.temp_formats.forEach(form => {
            if (form.type === 'polygon') {
                this.context.beginPath();
                this.context.strokeStyle = '#0000ff';
                form.coords.forEach(point => {
                    this.context.lineTo(point.x, point.y);
                })
                this.context.stroke();
                this.context.closePath()
            } else if (form.type === 'arc') {
                this.context.beginPath();
                this.context.strokeStyle = '#0000ff';
                this.context.arc(form.x, form.y, form.r, 0, 2 * Math.PI);
                this.context.stroke();
                this.context.closePath()
            }
        });
    }
    this.tools = {
        free: {
            onmousedown: (e) => {
                this.drawing = true;
                this.temp_formats.push({ type: 'polygon', coords: [] });
            },
            onmouseup: (e) => {
                this.drawing = false;
                this.temp_formats[this.temp_formats.length-1].coords.push(this.temp_formats[this.temp_formats.length-1].coords[0]);
                this.formats = this.formats.concat(this.temp_formats);
                this.temp_formats = [];
                this.draw();
            },
            onmousemove: (e) => {
                if (this.drawing) {
                    this.temp_formats[this.temp_formats.length-1].coords.push({ x: e.offsetX, y: e.offsetY });
                    this.draw();
                }
            },
            onmouseleave: (e) => {
                if (this.drawing) {
                    this.drawing = false;
                    this.temp_formats = [];
                    this.draw();
                }
            }
        },
        rect: {
            onmousedown: (e) => {
                this.drawing = true;
                let coord = { x: e.offsetX, y: e.offsetY }
                this.temp_formats = [{ type: 'polygon', coords: [coord, coord, coord, coord, coord] }];
            },
            onmouseup: (e) => {
                this.drawing = false;
                this.formats = this.formats.concat(this.temp_formats);
                this.temp_formats = [];
                this.draw();
            },
            onmousemove: (e) => {
                if (this.drawing) {
                    this.temp_formats[0].coords[1] = { x: e.offsetX, y: this.temp_formats[0].coords[0].y };
                    this.temp_formats[0].coords[2] = { x: e.offsetX, y: e.offsetY };
                    this.temp_formats[0].coords[3] = { x: this.temp_formats[0].coords[0].x, y: e.offsetY };
                    this.draw();
                }
            },
            onmouseleave: (e) => {
                if (this.drawing) {
                    this.drawing = false;
                    this.temp_formats = [];
                    this.draw();
                }
            }
        },
        line: {
            onmousedown: (e) => {
                if (!this.drawing) {
                    this.temp_formats
                    this.drawing = true;
                    this.temp_formats = [{ type: 'polygon', coords: [{ x: e.offsetX, y: e.offsetY }, { x: e.offsetX, y: e.offsetY }] }];
                } else {
                    if (e.button === 2) {
                        this.temp_formats[0].coords.push(this.temp_formats[0].coords[0])
                        this.formats = this.formats.concat(this.temp_formats);
                        this.temp_formats = [];
                        this.drawing = false;
                        this.draw();
                    } else {
                        this.temp_formats[0].coords.splice(this.temp_formats[0].coords.length-1, 0, { x: e.offsetX, y: e.offsetY })
                    }
                }
            },
            onmouseup: (e) => {
            },
            onmousemove: (e) => {
                if (this.drawing) {
                    this.temp_formats[0].coords[this.temp_formats[0].coords.length-1] = { x: e.offsetX, y: e.offsetY };
                    this.draw();
                }
            },
            onmouseleave: (e) => {
            }
        },
        arc: {
            onmousedown: (e) => {
                this.drawing = true;
                this.temp_formats = [{ type: 'arc', x: e.offsetX, y: e.offsetY, r: 0 }];
            },
            onmouseup: (e) => {
                this.drawing = false;
                this.formats = this.formats.concat(this.temp_formats);
                this.temp_formats = [];
                this.draw();
            },
            onmousemove: (e) => {
                if (this.drawing) {
                    let a = this.temp_formats[0].x - e.offsetX;
                    let b = this.temp_formats[0].y - e.clientY
                    let radius = Math.sqrt( a*a + b*b );
                    this.temp_formats[0].r = radius;
                    this.draw();
                }
            },
            onmouseleave: (e) => {
                if (this.drawing) {
                    this.drawing = false;
                    this.temp_formats = [];
                    this.draw();
                }
            }
        }
    };
    this.setTool = (tool) => {
        this.element.onmousedown = this.tools[tool].onmousedown;
        this.element.onmouseup = this.tools[tool].onmouseup;
        this.element.onmousemove = this.tools[tool].onmousemove;
        this.element.onmouseleave = this.tools[tool].onmouseleave;
        this.temp_formats = [];
        this.drawing = false;
    }
    this.result = () => {
        return {
            width: this.element.width,
            height: this.element.height,
            forms: this.formats
        }
    }
};

(function() {
    init();
})();

function init() {
    var img = new Image();
    img.onload = () => {
        canvas = new CreateCanvas(document.getElementById('canvas'), img);
        canvas.setTool('free');
    };
    img.src = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLuiu-YdVp_Yg1ULyOB4tniowKrk_qoBFB6nI7YZ5CWbRUFxA0';
}

function changeTool(tool) {
    canvas.setTool(tool);
}