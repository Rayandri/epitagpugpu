// Create a GStreamer pipeline to stream a video through our plugin

#include <gst/gst.h>
#include <format>
#include "gstfilter.h"
#include "argh.h"


static gboolean
plugin_init (GstPlugin * plugin)
{

  /* FIXME Remember to set the rank if it's an element that is meant
     to be autoplugged by decodebin. */
  return gst_element_register (plugin, "myfilter", GST_RANK_NONE,
      GST_TYPE_MYFILTER);
}

static void my_code_init ()
{
  gst_plugin_register_static (
    GST_VERSION_MAJOR,
    GST_VERSION_MINOR,
    "myfilter",
    "Private elements of my application",
    plugin_init,
    "1.0",
    "LGPL",
    "",
    "",
    "");
}


int main(int argc, char* argv[])
{
  argh::parser cmdl(argc, argv);
  if (cmdl[{"-h", "--help"}])
  {
    g_printerr("Usage: %s --mode=[gpu,cpu] <filename> [--output=output.mp4]\n", argv[0]);
    return 0;
  }

  Parameters params;
  auto method = cmdl("mode", "cpu").str();
  auto filename = cmdl(1).str();
  auto output = cmdl({"-o", "--output"}, "").str();
  if (method == "cpu")
    params.device = e_device_t::CPU;
  else if (method == "gpu")
    params.device = e_device_t::GPU;
  else
  {
    g_printerr("Invalid method: %s\n", method.c_str());
    return 1;
  }
  
  // Initialize default parameters
  params.bg_uri = "";
  params.opening_size = 3;
  params.th_low = 30;
  params.th_high = 60;
  params.bg_sampling_rate = 500;
  params.bg_number_frame = 10;

  gst_init(&argc, &argv);
  my_code_init();
  cpt_init(&params);

  // Create a GStreamer pipeline with videoflip to handle rotation metadata
  const char* pipe_str;
  if (output.empty())
    pipe_str = "filesrc name=fsrc ! decodebin ! videoflip method=automatic ! videoconvert ! video/x-raw, format=(string)RGB ! myfilter name=myfilter ! videoconvert ! fpsdisplaysink sync=false";
  else
    pipe_str = "filesrc name=fsrc ! decodebin ! videoflip method=automatic ! videoconvert ! video/x-raw, format=(string)RGB ! myfilter name=myfilter ! videoconvert ! video/x-raw, format=I420 ! x264enc ! mp4mux ! filesink name=fdst";

  GError *error = NULL;
  auto pipeline = gst_parse_launch(pipe_str, &error);
  if (!pipeline)
  {
    g_printerr("Failed to create pipeline: %s\n", error ? error->message : "unknown error");
    if (error) g_error_free(error);
    return 1;
  }

  auto filesrc = gst_bin_get_by_name (GST_BIN (pipeline), "fsrc");
  if (!filesrc)
  {
    g_printerr("Could not find filesrc element!\n");
    return 1;
  }
  g_object_set (filesrc, "location", filename.c_str(), NULL);
  g_object_unref (filesrc);

  auto myfilter = gst_bin_get_by_name (GST_BIN (pipeline), "myfilter");
  if (myfilter)
  {
    g_object_set (myfilter, "method", (gint)params.device, NULL);
    g_object_unref (myfilter);
  }
  else
  {
    g_printerr("Could not find myfilter element!\n");
    return 1;
  }

  if (!output.empty())
  {
    auto filesink = gst_bin_get_by_name (GST_BIN (pipeline), "fdst");
    g_object_set (filesink, "location", output.c_str(), NULL);
    g_object_unref (filesink);
  }

  // Start the pipeline
  gst_element_set_state(pipeline, GST_STATE_PLAYING);

  // Wait until error or EOS
  GstBus* bus = gst_element_get_bus(pipeline);
  GstMessage* msg = gst_bus_timed_pop_filtered(bus, GST_CLOCK_TIME_NONE, (GstMessageType)(GST_MESSAGE_ERROR | GST_MESSAGE_EOS));

  // Free resources
  if (msg != nullptr)
    gst_message_unref(msg);
  gst_object_unref(bus);
  gst_element_set_state(pipeline, GST_STATE_NULL);
  gst_object_unref(pipeline);

  return 0;
}
