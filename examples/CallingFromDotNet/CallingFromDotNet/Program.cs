using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using EdgeJs;

namespace CallingFromDotNet
{
    class Program
    {
        static void Main(string[] args)
        {
            var func = Edge.Func(@"
                var example = require('./../js/example');
                
                return function (data, callback) {
                    var result = example(data.node, data.state);
                    callback(null, result);
                }
            ");

            var resultRainTrue = func(new
            {
                node = "RAIN",
                state = "T"
            }).Result;

            var resultGrassWetFalse = func(new
            {
                node = "GRASS_WET",
                state = "F"
            }).Result;

            Console.WriteLine($"R(T) = {resultRainTrue}");
            Console.WriteLine($"GW(F) = {resultGrassWetFalse}");
        }
    }
}
