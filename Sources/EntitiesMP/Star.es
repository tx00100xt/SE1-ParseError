2203
%{
#include "EntitiesMP/StdH/StdH.h"
%}

enum StarType {
  0 ST_CHROME    "",
  1 ST_GOLD      "",
  2 ST_COPPER    "",
};

class CStar: CMovableModelEntity {
name      "Star";
thumbnail "";

properties:

 1 enum StarType m_stType = ST_CHROME,
 2 FLOAT fSize = 1.0f,


components:

  1 model   MODEL_STAR           "Models\\Star\\Star.mdl",
  2 texture TEXTURE_STAR         "Models\\Star\\Star.tex",
  3 texture TEX_SPEC             "Models\\SpecularTextures\\Medium.tex",
  4 texture TEX_REFL_CHROME      "Models\\ReflectionTextures\\Chrome1.tex",
  5 texture TEX_REFL_GOLD        "Models\\ReflectionTextures\\Gold02.tex",
  6 texture TEX_REFL_COPPER      "Models\\ReflectionTextures\\Copper01.tex",
  //4 texture TEX_REFL      "Models\\ReflectionTextures\\BWRiples01.tex",

functions:

	void ReOrient(void)
	{
		//CPrintF("ReOrient()\n");
	}

  /* Adjust model shading parameters */
  BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
      colAmbient = C_WHITE;
      return FALSE;
  }

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    return( sizeof(CStar) - sizeof(CRationalEntity) + CRationalEntity::GetUsedMemory());
  }

procedures:


  Main()
  {
    //CPrintF("Star Main()\n");
    // initialize
    InitAsModel();
    SetPhysicsFlags(EPF_MODEL_PUSHAROUND);
    SetCollisionFlags(ECF_IMMATERIAL);
		SetFlags(GetFlags()|ENF_CROSSESLEVELS);
    // set appearance
    SetModel(MODEL_STAR);
    if (m_stType==ST_CHROME) {
      SetModelMainTexture(TEX_REFL_CHROME);
      SetModelReflectionTexture(TEX_REFL_CHROME);
    } else if (m_stType==ST_GOLD) {
      SetModelMainTexture(TEX_REFL_GOLD);
      SetModelReflectionTexture(TEX_REFL_GOLD);
    } else {
      SetModelMainTexture(TEX_REFL_COPPER);
      SetModelReflectionTexture(TEX_REFL_COPPER);
    }
    SetModelSpecularTexture(TEX_SPEC);
    // set size
    GetModelObject()->StretchModel(FLOAT3D(1, 1, 1)*fSize);
    ModelChangeNotify();

    AddToMovers();

    wait () {
      on (EBegin) : { resume; }
      on (EEnd) : { stop; }
    }

    Destroy();

    return;
  }
};

