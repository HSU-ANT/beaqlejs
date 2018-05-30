#!/bin/bash

pandoc README.md -V geometry:margin=3.5cm -V title=BeaqleJS\ Documentation -s -o README.html
pandoc README.md -V geometry:margin=3.5cm -V title=BeaqleJS\ Documentation -s -o README.pdf
