var dataArray
var analyser
var ctx
var bufferLength
var totalDados = []
var dadosExportar = []
var guassianDistribution = function(x, a, b, c){
    //This function returns a normal distribution with a peak height of a, center position of b, and Gaussian RMS width of c.
    //More information here https://en.wikipedia.org/wiki/Gaussian_function
    return a * Math.pow(Math.E, -1.0*((x-b)*(x-b))/(2*(c*c)));
}


window.onload = function() {
  
    var file = document.getElementById("thefile");
    var audio = document.getElementById("audio");
    
    file.onchange = function(value) {

      //Create audio source and connect it to the input file
      var files = this.files;
      audio.src = URL.createObjectURL(files[0]);
      audio.load();
      audio.play();
      var context = new AudioContext();
      var src = context.createMediaElementSource(audio);
      analyser = context.createAnalyser();
  
      //Create and initialize drawing space
      var canvas = document.getElementById("canvas");
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx = canvas.getContext("2d");


      //Connect audio node analyser and adjust settings
      src.connect(analyser);
      analyser.connect(context.destination);
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.9;
      //analyser.minDecibels = -90;
      //analyser.maxDecibels = -10;
      
      //Variable information used for drawing the bands of the visualizer
      //Default audio context includes frequencies well above the audible range.
      //To adjust this we truncate frequencyBinCount to include only audible frequencies.
      //This results in a more pleasing aesthetic.
      bufferLength = Math.floor(analyser.frequencyBinCount/ 1.50); 
      dataArray = new Uint8Array(bufferLength);
      var WIDTH = canvas.width;
      var HEIGHT = canvas.height;
      var barWidth = (WIDTH / bufferLength);

      //Print information for debugging.
      console.log("Buffer Length: ", bufferLength);
      console.log("HEIGHT: ", HEIGHT);
      console.log("WIDTH: ", WIDTH);
      console.log("barWidth: ", barWidth);
      console.log("maxDB: ", analyser.maxDecibels);
      console.log("minDB: ", analyser.minDecibels);
      console.log("sampleRate: ", context.sampleRate);
      console.log("Smoothing Time Constant: ", analyser.smoothingTimeConstant);
      gettingData()

      function gettingData () {
        var drawVisual = requestAnimationFrame(gettingData);
        analyser.getByteTimeDomainData(dataArray);
        totalDados.push(dataArray)
      }

      audio.addEventListener('pause', () => {
        grafico()
        console.log('dados exportar => ', dadosExportar)
      })

      function grafico () {
        ctx.fillStyle = 'rgb(200, 200, 200)';
        ctx.fillRect(0, 0, 400, 400);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgb(0, 0, 0)';
        ctx.beginPath();
        var sliceWidth = 400 * 1.0 / bufferLength;
        var x = 0;

        for (var b = 0; b < totalDados.length; b++) {
            for(var i = 0; i < totalDados[b].length; i++) {

                var v = dataArray[i] / 128.0;
                var y = v * 400/2;
    
                if(i === 0) {
                    dadosExportar.push(JSON.stringify({ x: x, y: y }))
                ctx.moveTo(x, y);
                } else {
                    dadosExportar.push(JSON.stringify({ x: x, y: y }))
                ctx.lineTo(x, y);
                }
    
                x += sliceWidth;
            }
        }

        ctx.lineTo(canvas.width, canvas.height/2);
        ctx.stroke();
      }
    };
  };