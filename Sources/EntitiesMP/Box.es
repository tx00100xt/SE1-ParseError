2202
%{
#include "EntitiesMP/StdH/StdH.h"
#include "EntitiesMP/Item.h"
#include "Models/Box/Sphere.h"
%}

class CBox: CMovableModelEntity {
name      "Box";
thumbnail "";

properties:

  1 INDEX m_iSize = 2,
  2 CEntityPointer m_penTarget,
	3 CEntityPointer m_penOwner,

components:

  //1 model   MODEL_BOX            "Models\\Editor\\DoorController.mdl",
  //2 texture TEXTURE_BOX          "Models\\Editor\\DoorController.tex",
	//1 model   MODEL_BOX            "Models\\Box\\TouchSphere.mdl",
  1 model   MODEL_BOX            "Models\\Box\\Sphere.mdl",
  2 texture TEXTURE_BOX          "Models\\Box\\Box.tex",

functions:

  // returns bytes of memory used by this object
  SLONG GetUsedMemory(void)
  {
    return( sizeof(CBox) - sizeof(CMovableModelEntity) + CMovableModelEntity::GetUsedMemory());
  }

  /*BOOL AdjustShadingParameters(FLOAT3D &vLightDirection, COLOR &colLight, COLOR &colAmbient)
  {
		return FALSE;
	}

  // Adjust model mip factor in SEd
  void AdjustMipFactor(FLOAT &fMipFactor)
  {
    fMipFactor = 0;
  }*/

  class CItem *GetOwner(void)
  {
    ASSERT(m_penOwner!=NULL);
    return (CItem*) m_penOwner.ep_pen;
  }


procedures:

  Main()
  {
    // initialize
    InitAsEditorModel();
		//InitAsModel();
    SetPhysicsFlags(EPF_MODEL_IMMATERIAL);
    SetCollisionFlags(ECF_TOUCHMODEL);
    SetModel(MODEL_BOX);
    SetModelMainTexture(TEXTURE_BOX);

		
		if (m_iSize == 0) {
			StartModelAnim(SPHERE_ANIM_XSMALL, AOF_LOOPING|AOF_NORESTART);
			ForceCollisionBoxIndexChange(SPHERE_COLLISION_BOX_XSMALL);
		} else if (m_iSize == 1) {
			StartModelAnim(SPHERE_ANIM_SMALL, AOF_LOOPING|AOF_NORESTART);
			ForceCollisionBoxIndexChange(SPHERE_COLLISION_BOX_SMALL);
		} else if (m_iSize == 2) {
			StartModelAnim(SPHERE_ANIM_DEFAULT, AOF_LOOPING|AOF_NORESTART);
			ForceCollisionBoxIndexChange(SPHERE_COLLISION_BOX_MEDIUM);
		} else if (m_iSize == 3) {
			StartModelAnim(SPHERE_ANIM_LARGE, AOF_LOOPING|AOF_NORESTART);
			ForceCollisionBoxIndexChange(SPHERE_COLLISION_BOX_LARGE);
		}

		//AddToMovers();

		// wait 
		wait() {
			// when someone enters
			on (EPass ePass) : { 
				if (IsOfClass(ePass.penOther, "Player") || IsOfClass(ePass.penOther, "PlayerBot")) {
					//CPrintF("TB Event Sent to: \n", GetOwner()->m_penTarget->GetName());
					if (m_penTarget!=NULL) {
						SendToTarget(m_penTarget, EET_TRIGGER, ePass.penOther);
						if (m_penOwner != NULL) {
							GetOwner()->m_penTarget = NULL;
						}
					}
					stop;
				} else {
					resume;
				}
			}
		}

    // wait a bit to recover
    autowait(0.1f);

    Destroy();

    return;
  }
};

